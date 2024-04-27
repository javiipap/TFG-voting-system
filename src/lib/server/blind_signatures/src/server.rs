use crate::conversions::{ToObject, ToString};

use blind_rsa_signatures::{
    reexports::rsa::pkcs8::der::Encode, KeyPair, MessageRandomizer, Options, PublicKey, SecretKey,
    Signature,
};
use neon::prelude::*;
use rand::thread_rng;

pub fn generate_rsa_keypair(mut cx: FunctionContext) -> JsResult<JsObject> {
    let mut rng = thread_rng();

    KeyPair::generate(&mut rng, 2048)
        .unwrap()
        .to_object(&mut cx)
}

pub fn sign(mut cx: FunctionContext) -> JsResult<JsString> {
    let secret_key_pem: Handle<JsString> = cx.argument(0)?;
    let blind_msg: Handle<JsString> = cx.argument(1)?;

    let options = Options::default();
    let private_key = SecretKey::from_pem(&secret_key_pem.value(&mut cx)).unwrap();
    let mut rng = thread_rng();

    private_key
        .blind_sign(&mut rng, &blind_msg.value(&mut cx), &options)
        .unwrap()
        .to_string(&mut cx)
}

pub fn verify(mut cx: FunctionContext) -> JsResult<JsBoolean> {
    let public_key_pem: Handle<JsString> = cx.argument(0)?;
    let signature_bytes: Handle<JsString> = cx.argument(1)?;
    let msg_randomizer: Handle<JsString> = cx.argument(2)?;
    let msg: Handle<JsString> = cx.argument(3)?;

    let public_key = PublicKey::from_pem(&public_key_pem.value(&mut cx)).unwrap();
    let options = Options::default();

    let signature = Signature::new(signature_bytes.value(&mut cx).to_vec().unwrap());

    let buff: [u8; 32] = msg_randomizer
        .value(&mut cx)
        .to_vec()
        .unwrap()
        .try_into()
        .unwrap();

    Ok(
        match signature.verify(
            &public_key,
            Some(MessageRandomizer::new(buff)),
            msg.value(&mut cx).to_vec().unwrap(),
            &options,
        ) {
            Ok(_) => cx.boolean(true),
            Err(_) => cx.boolean(false),
        },
    )
}
