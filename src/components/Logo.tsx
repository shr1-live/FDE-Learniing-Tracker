/** The FiftyFive Technologies logo, as supplied (never redrawn or recoloured). The coloured file shows on light, the white one on dark. */
export function Logo() {
  return (
    <>
      <img className="brand-logo" src="/assets/fiftyfive-logo-color.svg" alt="FiftyFive Technologies" width="105" height="26" />
      <img className="brand-logo on-dark" src="/assets/fiftyfive-logo-white.svg" alt="FiftyFive Technologies" width="105" height="26" />
    </>
  );
}
