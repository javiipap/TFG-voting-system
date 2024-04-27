mod client;
mod conversions;
mod server;

pub use client::*;
pub use server::*;

#[cfg(test)]
mod tests {
    use super::*;

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
