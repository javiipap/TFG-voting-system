use std::error::Error;

use elastic_elgamal::app::{ChoiceParams, EncryptedChoice, SingleChoice};
use elastic_elgamal::group::Ristretto;
use elastic_elgamal::{Ciphertext, Keypair, PublicKey};
use rand::thread_rng;
use serde_json;

pub fn generate_elgamal_keypair() -> (Vec<u8>, Vec<u8>) {
    let mut rng = thread_rng();
    let key_pair = Keypair::<Ristretto>::generate(&mut rng);

    (
        Vec::from(key_pair.public().as_bytes()),
        Vec::from(*key_pair.secret().expose_scalar().as_bytes()),
    )
}

pub fn encrypt_vote(pub_key_bytes: Vec<u8>, choice: usize, options_count: usize) -> String {
    let rng = &mut thread_rng();
    let receiver = PublicKey::<Ristretto>::from_bytes(&pub_key_bytes).unwrap();
    let params = ChoiceParams::single(receiver, options_count);
    let ballot = EncryptedChoice::single(&params, choice, rng);

    println!("{}", serde_json::to_string_pretty(&ballot).unwrap());

    serde_json::to_string(&ballot).unwrap()
}

pub fn sum_ballot_option(acc: String, ballot: String) -> Result<String, Box<dyn Error>> {
    let parsed_ballot: EncryptedChoice<Ristretto, SingleChoice> = serde_json::from_str(&ballot)?;
    let mut parsed_acc: Vec<Ciphertext<Ristretto>> = serde_json::from_str(&acc)?;

    assert_eq!(parsed_ballot.len(), parsed_acc.len());

    for (i, choice) in parsed_ballot.choices_unchecked().iter().enumerate() {
        parsed_acc[i] += *choice;
    }

    Ok(serde_json::to_string(&parsed_acc)?)
}

pub fn verify_vote(
    pub_key_bytes: Vec<u8>,
    vote: String,
    options_count: usize,
) -> Result<(), Box<dyn Error>> {
    let receiver = PublicKey::<Ristretto>::from_bytes(&pub_key_bytes)?;
    let params = ChoiceParams::single(receiver, options_count);
    let ballot: EncryptedChoice<Ristretto, SingleChoice> = serde_json::from_str(&vote)?;

    ballot.verify(&params)?;

    Ok(())
}
