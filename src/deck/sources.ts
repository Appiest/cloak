export type Source = { citation: string; url: string };

export const sources = {
  ukCctvEstimate: {
    citation:
      "UK police estimate by Deputy Chief Constable Graeme Gerrard, as reported by the Press Association. Security Buyer, 3 March 2011.",
    url: "https://securitybuyer.com/in-the-press-how-the-media-is-reporting-the-1-85-million-cameras-story/",
  },
  weeklyCameraCount: {
    citation: "Safety.com, via StudyFinds, 24 September 2020.",
    url: "https://studyfinds.com/americans-security-cameras-study/",
  },
  rentalSurvey: {
    citation: "IPX1031, Surveillance Camera Use in Short-Term Rentals. Survey of 1,050 US adults, June 2025.",
    url: "https://www.ipx1031.com/surveillance-rental-study/",
  },
  ftcVoiceCloning: {
    citation: "FTC Consumer Alert, Scammers use AI to enhance their family emergency schemes, 20 March 2023.",
    url: "https://consumer.ftc.gov/consumer-alerts/2023/03/scammers-use-ai-enhance-their-family-emergency-schemes",
  },
  deepfakeDetection: {
    citation: "Mai et al., Warning: Humans cannot reliably detect speech deepfakes. PLOS ONE, 2 August 2023. n = 529.",
    url: "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0285333",
  },
  fbiGenerativeFraud: {
    citation: "FBI IC3, Criminals Use Generative Artificial Intelligence to Facilitate Financial Fraud, 3 December 2024.",
    url: "https://www.ic3.gov/PSA/2024/PSA241203",
  },
  gaoPrivacyLaw: {
    citation:
      "GAO, Facial Recognition Technology: Privacy and Accuracy Issues Related to Commercial Uses. GAO-20-522, July 2020.",
    url: "https://www.gao.gov/products/gao-20-522",
  },
  airbnbCameraBan: {
    citation: "Airbnb, An update on our policy on security cameras, 11 March 2024.",
    url: "https://news.airbnb.com/an-update-on-our-policy-on-security-cameras/",
  },
  flockAgencies: {
    citation: "Flock Safety blog, City leaders choose Flock Safety, 24 July 2026.",
    url: "https://www.flocksafety.com/blog/city-leaders-choose-flock-safety-a-proven-community-focused-public-safety-solution",
  },
  flockStates: {
    citation: "Flock Safety, License Plate Readers product page, accessed 18 September 2026.",
    url: "https://www.flocksafety.com/products/license-plate-readers",
  },
  infraredMask: {
    citation: "Zhou et al., Invisible Mask: Practical Attacks on Face Recognition with Infrared. arXiv:1803.04683, March 2018.",
    url: "https://arxiv.org/abs/1803.04683",
  },
  phoneIrFilters: {
    citation: "Carolina Biological Supply, Make the Invisible Visible, 10 December 2020.",
    url: "https://knowledge.carolina.com/discipline/physical-science/physics/make-the-invisible-visible/",
  },
  wearableJammer: {
    citation: "Chen et al., Wearable Microphone Jamming. CHI 2020, University of Chicago.",
    url: "https://lab.plopes.org/published/2020-CHI-jammer.pdf",
  },
} satisfies Record<string, Source>;
