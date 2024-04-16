use std::error::Error;

use blind_rsa_signatures::{
    BlindSignature, BlindingResult, KeyPair, MessageRandomizer, Options, PublicKey, Secret,
    SecretKey, Signature,
};
use rand::thread_rng;

pub fn generate_rsa_keypair() -> Result<(String, String), Box<dyn Error>> {
    let mut rng = thread_rng();
    let kp = KeyPair::generate(&mut rng, 2048)?;

    Ok((kp.pk.to_pem()?, kp.sk.to_pem()?))
}

pub fn create_request(
    public_key_pem: String,
    msg: Vec<u8>,
) -> Result<BlindingResult, Box<dyn Error>> {
    let options = Options::default();
    let mut rng = thread_rng();
    let public_key = PublicKey::from_pem(&public_key_pem)?;

    Ok(public_key.blind(&mut rng, msg, true, &options)?)
}

pub fn sign(private_key_pem: String, blind_msg: Vec<u8>) -> Result<BlindSignature, Box<dyn Error>> {
    let options = Options::default();
    let private_key = SecretKey::from_pem(&private_key_pem)?;
    let mut rng = thread_rng();

    Ok(private_key.blind_sign(&mut rng, &blind_msg, &options)?)
}

pub fn unblind(
    public_key_pem: String,
    msg: Vec<u8>,
    secret: Vec<u8>,
    msg_randomizer: [u8; 32],
    blind_sig: Vec<u8>,
) -> Result<Signature, Box<dyn Error>> {
    let options = Options::default();
    let public_key = PublicKey::from_pem(&public_key_pem)?;

    Ok(public_key.finalize(
        &BlindSignature::new(blind_sig),
        &Secret::new(secret),
        Some(MessageRandomizer::new(msg_randomizer)),
        msg,
        &options,
    )?)
}

pub fn verify(
    public_key_pem: String,
    signature_bytes: Vec<u8>,
    msg_randomizer: [u8; 32],
    msg: Vec<u8>,
) -> Result<(), Box<dyn Error>> {
    let public_key = PublicKey::from_pem(&public_key_pem)?;
    let options = Options::default();

    let signature = Signature::new(signature_bytes);

    Ok(signature.verify(
        &public_key,
        Some(MessageRandomizer::new(msg_randomizer)),
        msg,
        &options,
    )?)
}
