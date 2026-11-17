const AWIN_PUBLISHER_ID = "3136258";

const advertiserIdsByHostname: Record<string, string> = {
  "addisonross.com": "128625",
  "andrewmartin.co.uk": "21814",
  "andsotobed.co.uk": "7913",
  "aspirestore.co.uk": "23001",
  "backtotheoffice.co.uk": "61655",
  "bedkingdom.co.uk": "114292",
  "bedeckhome.com": "6321",
  "carpets-online.co.uk": "124774",
  "casadistone.com": "130657",
  "cheapfurniturewarehouse.co.uk": "107998",
  "commissionit.co.uk": "131099",
  "deubaxxl.co.uk": "20516",
  "dreaminteriors.co.uk": "72391",
  "formadore.co.uk": "130025",
  "gameoverstore.co.uk": "37282",
  "gardensanctuary.co.uk": "57285",
  "greatbeanbags.com": "86627",
  "homespacedirect.com": "129637",
  "intelroll.co.uk": "131357",
  "itskaos.com": "120033",
  "kiddies-kingdom.com": "2191",
  "kuishi.com": "111020",
  "kurtens.com": "129075",
  "laudsleep.com": "131445",
  "laybrook.com": "5172",
  "lights.co.uk": "7574",
  "lightsin.co.uk": "106979",
  "livingwithluxury.co.uk": "119901",
  "loomyhome.com": "90515",
  "luxemattresses.co.uk": "114686",
  "mint-outdoor.com": "114094",
  "mycloudtopper.com": "131311",
  "nkuku.com": "18225",
  "officefurnitureonline.co.uk": "29979",
  "pooky.com": "20426",
  "readysteadybed.co.uk": "123396",
  "rinkit.com": "106125",
  "ritconcept.com": "131305",
  "scandiborn.co.uk": "85735",
  "simbasleep.com": "6878",
  "slf24.co.uk": "130421",
  "sosoftbeds.co.uk": "60165",
  "starlightbeds.co.uk": "121884",
  "steamandoak.co.uk": "124894",
  "sunjoyshop.co.uk": "122838",
  "thefoampeople.co.uk": "121412",
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
