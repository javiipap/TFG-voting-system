use blind_rsa_signatures::{
    reexports::rsa::pkcs8::der::Encode, BlindSignature, MessageRandomizer, Options, PublicKey,
    Secret,
};
use rand::thread_rng;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(getter_with_clone)]
pub struct ExportedBlindingResult {
    pub blind_msg: String,
    pub secret: String,
    pub msg_randomizer: String,
}

#[wasm_bindgen]
pub fn create_request(public_key_pem: String, msg: String) -> ExportedBlindingResult {
    let options = Options::default();
    let mut rng = thread_rng();
    let public_key = PublicKey::from_pem(&public_key_pem).unwrap();

    let res = public_key.blind(&mut rng, msg, true, &options).unwrap();

    ExportedBlindingResult {
        blind_msg: String::from_utf8(res.blind_msg.0).unwrap(),
        secret: String::from_utf8(res.secret.0).unwrap(),
        msg_randomizer: String::from_utf8(res.msg_randomizer.unwrap().0.into()).unwrap(),
    }
}

#[wasm_bindgen]
pub fn unblind(
    public_key_pem: String,
    msg: String,
    secret: String,
    msg_randomizer: String,
    blind_sig: String,
) -> String {
    let options = Options::default();
    let public_key = PublicKey::from_pem(&public_key_pem).unwrap();

    let buff: [u8; 32] = msg_randomizer.to_vec().unwrap().try_into().unwrap();

    String::from_utf8(
        public_key
            .finalize(
                &BlindSignature::new(blind_sig.into()),
                &Secret::new(secret.into_bytes()),
                Some(MessageRandomizer::new(buff)),
                msg,
                &options,
            )
            .unwrap()
            .0,
    )
    .unwrap()
}
