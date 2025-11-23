namespace SwordIntel.Crypto

open System
open System.Security.Cryptography
open Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
open Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
open Org.BouncyCastle.Security

/// Post-Quantum Cryptography using ML-KEM (Kyber) and ML-DSA (Dilithium)
module PostQuantum =

    /// Kyber-1024 key pair for key encapsulation
    type KyberKeyPair = {
        PublicKey: byte[]
        PrivateKey: byte[]
    }

    /// Dilithium-5 key pair for digital signatures
    type DilithiumKeyPair = {
        PublicKey: byte[]
        PrivateKey: byte[]
    }

    /// Encapsulated key and ciphertext
    type EncapsulatedKey = {
        Ciphertext: byte[]
        SharedSecret: byte[]
    }

    /// Generate ML-KEM-1024 key pair
    let generateKyberKeyPair () =
        let keyGen = KyberKeyPairGenerator()
        let random = SecureRandom()
        let parameters = KyberKeyGenerationParameters(random, KyberParameters.kyber1024)
        keyGen.Init(parameters)

        let keyPair = keyGen.GenerateKeyPair()
        let pubKey = keyPair.Public :?> KyberPublicKeyParameters
        let privKey = keyPair.Private :?> KyberPrivateKeyParameters

        {
            PublicKey = pubKey.GetEncoded()
            PrivateKey = privKey.GetEncoded()
        }

    /// Encapsulate a shared secret using recipient's public key
    let encapsulate (publicKey: byte[]) =
        let kemGenerator = KyberKemGenerator(SecureRandom())
        let pubKeyParams = KyberPublicKeyParameters(KyberParameters.kyber1024, publicKey)

        let secretWithEncapsulation = kemGenerator.GenerateEncapsulated(pubKeyParams)

        {
            Ciphertext = secretWithEncapsulation.GetEncapsulation()
            SharedSecret = secretWithEncapsulation.GetSecret()
        }

    /// Decapsulate shared secret using private key
    let decapsulate (privateKey: byte[]) (ciphertext: byte[]) =
        let kemExtractor = KyberKemExtractor(KyberPrivateKeyParameters(KyberParameters.kyber1024, privateKey))
        kemExtractor.ExtractSecret(ciphertext)

    /// Generate ML-DSA-87 (Dilithium-5) key pair for signing
    let generateDilithiumKeyPair () =
        let keyGen = DilithiumKeyPairGenerator()
        let random = SecureRandom()
        let parameters = DilithiumKeyGenerationParameters(random, DilithiumParameters.Dilithium5)
        keyGen.Init(parameters)

        let keyPair = keyGen.GenerateKeyPair()
        let pubKey = keyPair.Public :?> DilithiumPublicKeyParameters
        let privKey = keyPair.Private :?> DilithiumPrivateKeyParameters

        {
            PublicKey = pubKey.GetEncoded()
            PrivateKey = privKey.GetEncoded()
        }

    /// Sign data using Dilithium private key
    let sign (privateKey: byte[]) (data: byte[]) =
        let privKeyParams = DilithiumPrivateKeyParameters(DilithiumParameters.Dilithium5, privateKey)
        let signer = DilithiumSigner()
        signer.Init(true, privKeyParams)
        signer.GenerateSignature(data)

    /// Verify signature using Dilithium public key
    let verify (publicKey: byte[]) (data: byte[]) (signature: byte[]) =
        let pubKeyParams = DilithiumPublicKeyParameters(DilithiumParameters.Dilithium5, publicKey)
        let signer = DilithiumSigner()
        signer.Init(false, pubKeyParams)
        signer.VerifySignature(data, signature)

    /// Hybrid encryption: AES-256-GCM with ML-KEM key encapsulation
    let encryptHybrid (recipientPublicKey: byte[]) (plaintext: byte[]) =
        // Encapsulate a shared secret
        let encapsulated = encapsulate recipientPublicKey

        // Use shared secret as AES key (first 32 bytes)
        use aes = Aes.Create()
        aes.KeySize <- 256
        aes.Mode <- CipherMode.GCM
        aes.Key <- encapsulated.SharedSecret.[..31]

        let nonce = RandomNumberGenerator.GetBytes(12) // GCM standard nonce size
        aes.IV <- nonce

        use encryptor = aes.CreateEncryptor()
        let ciphertext = encryptor.TransformFinalBlock(plaintext, 0, plaintext.Length)

        // Return ciphertext || nonce || kyber_ciphertext
        Array.concat [ciphertext; nonce; encapsulated.Ciphertext]

    /// Hybrid decryption
    let decryptHybrid (privateKey: byte[]) (encryptedData: byte[]) =
        // Extract components (last bytes are kyber ciphertext)
        let kyberCiphertextSize = 1568 // Kyber-1024 ciphertext size
        let nonceSize = 12

        let ciphertextSize = encryptedData.Length - nonceSize - kyberCiphertextSize
        let ciphertext = encryptedData.[..ciphertextSize-1]
        let nonce = encryptedData.[ciphertextSize..ciphertextSize+nonceSize-1]
        let kyberCiphertext = encryptedData.[ciphertextSize+nonceSize..]

        // Decapsulate shared secret
        let sharedSecret = decapsulate privateKey kyberCiphertext

        // Decrypt with AES-256-GCM
        use aes = Aes.Create()
        aes.KeySize <- 256
        aes.Mode <- CipherMode.GCM
        aes.Key <- sharedSecret.[..31]
        aes.IV <- nonce

        use decryptor = aes.CreateDecryptor()
        decryptor.TransformFinalBlock(ciphertext, 0, ciphertext.Length)
