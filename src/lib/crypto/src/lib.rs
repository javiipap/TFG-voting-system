mod ballot;
mod blind_signature;

pub use ballot::*;
pub use blind_signature::*;

#[cfg(test)]
mod tests {
    use elastic_elgamal::{
        app::{ChoiceParams, EncryptedChoice, SingleChoice},
        group::Ristretto,
        Ciphertext, DiscreteLogTable, PublicKey, SecretKey,
    };

    use super::*;

    fn tally(pub_key_bytes: Vec<u8>, votes: Vec<String>, options_count: usize) -> String {
        let receiver = PublicKey::<Ristretto>::from_bytes(&pub_key_bytes).unwrap();
        let params = ChoiceParams::single(receiver, options_count);
        let mut result =
            serde_json::to_string(&vec![Ciphertext::<Ristretto>::zero(); options_count]).unwrap();

        votes.iter().for_each(|v| {
            let parsed: EncryptedChoice<Ristretto, SingleChoice> = serde_json::from_str(v).unwrap();

            match parsed.verify(&params) {
                Ok(_) => result = sum_ballot_option(result.clone(), v.clone()).unwrap(),
                Err(_) => (),
            }
        });

        result
    }

    #[test]
    fn e2e_election_works() {
        let (pub_key_bytes, secret_key_bytes) = generate_elgamal_keypair();
        let encrypted: Vec<String> = vec![
            encrypt_vote(pub_key_bytes.clone(), 2, 5),
            encrypt_vote(pub_key_bytes.clone(), 3, 5),
            encrypt_vote(pub_key_bytes.clone(), 4, 5),
            encrypt_vote(pub_key_bytes.clone(), 3, 5),
            encrypt_vote(pub_key_bytes.clone(), 3, 5),
            encrypt_vote(pub_key_bytes.clone(), 3, 5),
        ];

        let res = tally(pub_key_bytes, encrypted, 5);

        let parsed: Vec<Ciphertext<Ristretto>> = serde_json::from_str(&res).unwrap();

        let secret_key = SecretKey::<Ristretto>::from_bytes(&secret_key_bytes).unwrap();

        let lookup_table = DiscreteLogTable::new(0..20);

        let decrypted = parsed
            .iter()
            .map(|candidate| secret_key.decrypt(*candidate, &lookup_table))
            .collect::<Vec<_>>();

        println!("Final tally: {:?}", decrypted);
    }

    #[test]
    fn verify_vote_works() {
        let (pub_key_bytes, _) = generate_elgamal_keypair();
        let pub_key = PublicKey::<Ristretto>::from_bytes(&pub_key_bytes).unwrap();
        let params = ChoiceParams::single(pub_key, 5);
        let encrypted: EncryptedChoice<Ristretto, SingleChoice> =
            serde_json::from_str(&encrypt_vote(pub_key_bytes, 2, 5)).unwrap();

        encrypted.verify(&params).unwrap();
    }

    #[test]
    fn blind_signature_works() {
        let key_pair = generate_rsa_keypair().unwrap();
        println!("Generated key pair");

        let msg = Vec::from(b"Hola que tal");
        let req = create_request(key_pair.0.clone(), msg.clone()).unwrap();
        println!("Created request");

        let blind_signature = sign(key_pair.1, req.blind_msg.0).unwrap();
        println!("Signed request");

        let signature = unblind(
            key_pair.0.clone(),
            msg.clone(),
            req.secret.0,
            *req.msg_randomizer.unwrap(),
            blind_signature.0,
        )
        .unwrap();

        println!("Signature: {:?}", signature.0);

        let _ = verify(key_pair.0, signature.0, *req.msg_randomizer.unwrap(), msg);
    }
}
