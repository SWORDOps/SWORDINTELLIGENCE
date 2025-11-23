namespace SwordIntel.Crypto

open System
open System.Security.Cryptography
open System.Text

/// End-to-end message encryption with forward secrecy (Double Ratchet inspired)
module MessageEncryption =

    /// Message encryption result
    type EncryptedMessage = {
        Ciphertext: byte[]
        Nonce: byte[]
        Tag: byte[] option
        MessageNumber: int
    }

    /// Generate a random encryption key
    let generateKey () =
        RandomNumberGenerator.GetBytes(32)

    /// Derive key using HKDF
    let deriveKey (inputKeyMaterial: byte[]) (salt: byte[]) (info: string) =
        use hkdf = new HMACSHA256(salt)
        let prk = hkdf.ComputeHash(inputKeyMaterial)

        use hkdfExpand = new HMACSHA256(prk)
        let infoBytes = Encoding.UTF8.GetBytes(info)
        let t = hkdfExpand.ComputeHash(Array.concat [infoBytes; [|1uy|]])
        t.[..31] // Return 32 bytes

    /// Encrypt message with AES-256-GCM
    let encrypt (key: byte[]) (plaintext: byte[]) (associatedData: byte[] option) (messageNumber: int) =
        use aes = new AesGcm(key)
        let nonce = RandomNumberGenerator.GetBytes(12)
        let ciphertext = Array.zeroCreate<byte> plaintext.Length
        let tag = Array.zeroCreate<byte> 16

        match associatedData with
        | Some ad -> aes.Encrypt(nonce, plaintext, ciphertext, tag, ad)
        | None -> aes.Encrypt(nonce, plaintext, ciphertext, tag)

        {
            Ciphertext = ciphertext
            Nonce = nonce
            Tag = Some tag
            MessageNumber = messageNumber
        }

    /// Decrypt message with AES-256-GCM
    let decrypt (key: byte[]) (encryptedMsg: EncryptedMessage) (associatedData: byte[] option) =
        use aes = new AesGcm(key)
        let plaintext = Array.zeroCreate<byte> encryptedMsg.Ciphertext.Length

        match encryptedMsg.Tag, associatedData with
        | Some tag, Some ad ->
            aes.Decrypt(encryptedMsg.Nonce, encryptedMsg.Ciphertext, tag, plaintext, ad)
        | Some tag, None ->
            aes.Decrypt(encryptedMsg.Nonce, encryptedMsg.Ciphertext, tag, plaintext)
        | None, _ ->
            failwith "Authentication tag required"

        plaintext

    /// Add random padding to obfuscate message length (APT41 technique)
    let addPadding (data: byte[]) (targetSize: int option) =
        let paddingSize =
            match targetSize with
            | Some size -> max 0 (size - data.Length - 2) // -2 for length prefix
            | None -> RandomNumberGenerator.GetInt32(16, 256)

        let paddingBytes = RandomNumberGenerator.GetBytes(paddingSize)
        let lengthPrefix = BitConverter.GetBytes(uint16 data.Length)

        Array.concat [lengthPrefix; data; paddingBytes]

    /// Remove padding from message
    let removePadding (paddedData: byte[]) =
        if paddedData.Length < 2 then
            failwith "Invalid padded data"

        let originalLength = int (BitConverter.ToUInt16(paddedData, 0))
        paddedData.[2..originalLength+1]

    /// Generate decoy message for traffic obfuscation
    let generateDecoyMessage () =
        let decoySize = RandomNumberGenerator.GetInt32(100, 500)
        let decoy = RandomNumberGenerator.GetBytes(decoySize)

        // Add marker to identify as decoy (in practice, use steganographic marker)
        let marker = Encoding.UTF8.GetBytes("DECOY")
        Array.concat [marker; decoy]

    /// Check if message is a decoy
    let isDecoyMessage (data: byte[]) =
        if data.Length < 5 then false
        else
            let marker = data.[..4]
            Encoding.UTF8.GetString(marker) = "DECOY"

    /// Ratchet forward (simple chain key derivation)
    type RatchetState = {
        ChainKey: byte[]
        MessageNumber: int
    }

    /// Advance ratchet state
    let advanceRatchet (state: RatchetState) =
        let newChainKey = deriveKey state.ChainKey state.ChainKey "ratchet"
        let messageKey = deriveKey state.ChainKey state.ChainKey $"message-{state.MessageNumber}"

        let newState = {
            ChainKey = newChainKey
            MessageNumber = state.MessageNumber + 1
        }

        (messageKey, newState)

    /// Encrypt with ratchet
    let encryptWithRatchet (state: RatchetState) (plaintext: byte[]) =
        let (messageKey, newState) = advanceRatchet state
        let encrypted = encrypt messageKey plaintext None state.MessageNumber
        (encrypted, newState)

    /// Decrypt with ratchet (must maintain state synchronization)
    let decryptWithRatchet (state: RatchetState) (encryptedMsg: EncryptedMessage) =
        if encryptedMsg.MessageNumber <> state.MessageNumber then
            failwith "Message number mismatch - ratchet desynchronized"

        let (messageKey, newState) = advanceRatchet state
        let plaintext = decrypt messageKey encryptedMsg None
        (plaintext, newState)
