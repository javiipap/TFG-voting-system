mod client;

pub use client::*;

#[cfg(test)]
mod tests {
    use blind_rsa_signatures::KeyPair;
    use rand::thread_rng;

    use super::*;

    fn generate_rsa_keypair() -> KeyPair {
        let mut rng = thread_rng();

        KeyPair::generate(&mut rng, 2048).unwrap()
    }

    #[test]
    fn blind_signature_works() {
        let keypair = generate_rsa_keypair();
        let pkey = keypair.pk.to_pem().unwrap();

        println!("{pkey}");

        create_request(pkey, String::from("hola"));
    }
}
