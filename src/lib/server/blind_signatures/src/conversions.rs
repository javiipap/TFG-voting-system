use blind_rsa_signatures::{BlindSignature, BlindingResult, KeyPair};
use neon::prelude::*;

pub trait ToObject {
    fn to_object<'a>(&self, cx: &mut impl Context<'a>) -> JsResult<'a, JsObject>;
}

pub trait ToString {
    fn to_string<'a>(&self, cx: &mut impl Context<'a>) -> JsResult<'a, JsString>;
}

impl ToObject for KeyPair {
    fn to_object<'a>(&self, cx: &mut impl Context<'a>) -> JsResult<'a, JsObject> {
        let obj = cx.empty_object();

        let public = cx.string(&self.pk.to_pem().unwrap());
        let secret = cx.string(&self.sk.to_pem().unwrap());

        obj.set(cx, "secret", secret)?;
        obj.set(cx, "public", public)?;

        Ok(obj)
    }
}

impl ToObject for BlindingResult {
    fn to_object<'a>(&self, cx: &mut impl Context<'a>) -> JsResult<'a, JsObject> {
        let obj = cx.empty_object();

        let blind_msg = cx.string(&String::from_utf8(self.blind_msg.0.clone()).unwrap());
        let secret = cx.string(&String::from_utf8(self.secret.0.clone()).unwrap());
        let msg_randomizer =
            cx.string(&String::from_utf8(self.msg_randomizer.unwrap().0.into()).unwrap());

        obj.set(cx, "blindMsg", blind_msg)?;
        obj.set(cx, "secret", secret)?;
        obj.set(cx, "msgRandomizer", msg_randomizer)?;

        Ok(obj)
    }
}

impl ToString for BlindSignature {
    fn to_string<'a>(&self, cx: &mut impl Context<'a>) -> JsResult<'a, JsString> {
        Ok(JsString::new(
            cx,
            String::from_utf8(self.0.clone()).unwrap(),
        ))
    }
}
