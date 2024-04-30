use blind_rsa_signatures::{KeyPair, MessageRandomizer, Options, PublicKey, SecretKey, Signature};
use rand::thread_rng;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct ExportedKeyPair {
    pub pk: String,
    pub sk: String,
}

#[wasm_bindgen]
pub fn generate_rsa_keypair() -> ExportedKeyPair {
    let mut rng = thread_rng();

    let keypair = KeyPair::generate(&mut rng, 2048).unwrap();

    ExportedKeyPair {
        pk: keypair.pk.to_pem().unwrap(),
        sk: keypair.sk.to_pem().unwrap(),
    }
}

#[wasm_bindgen]
pub fn sign(secret_key_pem: String, blind_msg: String) -> Box<[u8]> {
    let options = Options::default();
    let private_key = SecretKey::from_pem(&secret_key_pem).unwrap();
    let mut rng = thread_rng();

    private_key
        .blind_sign(&mut rng, &blind_msg, &options)
        .unwrap()
        .0
        .into()
}

#[wasm_bindgen]
pub fn verify(
    public_key_pem: String,
    signature_bytes: Box<[u8]>,
    msg_randomizer: Box<[u8]>,
    msg: Box<[u8]>,
) -> bool {
    let public_key = PublicKey::from_pem(&public_key_pem).unwrap();
    let options = Options::default();

    let signature = Signature::new(signature_bytes.to_vec());

    let buff: [u8; 32] = msg_randomizer.to_vec().try_into().unwrap();

    match signature.verify(
        &public_key,
        Some(MessageRandomizer::new(buff)),
        msg.to_vec(),
        &options,
    ) {
        Ok(_) => true,
        Err(_) => false,
    }
}
