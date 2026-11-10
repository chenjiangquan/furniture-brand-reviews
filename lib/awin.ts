const AWIN_PUBLISHER_ID = "3136258";

const advertiserIdsByHostname: Record<string, string> = {
  "andrewmartin.co.uk": "21814",
  "andsotobed.co.uk": "7913",
  "aspirestore.co.uk": "23001",
  "bedkingdom.co.uk": "114292",
  "cheapfurniturewarehouse.co.uk": "107998",
  "dreaminteriors.co.uk": "72391",
  "formadore.co.uk": "130025",
  "gardensanctuary.co.uk": "57285",
  "kiddies-kingdom.com": "2191",
  "livingwithluxury.co.uk": "119901",
  "loomyhome.com": "90515",
  "luxemattresses.co.uk": "114686",
  "mint-outdoor.com": "114094",
  "mycloudtopper.com": "131311",
  "nkuku.com": "18225",
  "officefurnitureonline.co.uk": "29979",
  "readysteadybed.co.uk": "123396",
  "ritconcept.com": "131305",
  "scandiborn.co.uk": "85735",
  "simbasleep.com": "6878",
  "slf24.co.uk": "130421",
  "sosoftbeds.co.uk": "60165",
  "sunjoyshop.co.uk": "122838",
  "thesleeppeople.co.uk": "122648"
};

function getHostname(website: string) {
  try {
    return new URL(website).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function getAwinAffiliateUrl(website: string) {
  const advertiserId = advertiserIdsByHostname[getHostname(website)];
  if (!advertiserId) return null;

  const params = new URLSearchParams({
    awinmid: advertiserId,
    awinaffid: AWIN_PUBLISHER_ID,
    ued: website
  });

  return `https://www.awin1.com/cread.php?${params.toString()}`;
}
