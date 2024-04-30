use neon::prelude::*;

mod conversions;
mod server;

pub use server::*;

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("generateRsaKeypair", generate_rsa_keypair)?;
    cx.export_function("sign", sign)?;
    cx.export_function("verify", verify)?;

    Ok(())
}
