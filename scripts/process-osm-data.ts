// scripts/process-osm-data.ts
import fs from 'fs'
import path from 'path'
import osmtogeojson from 'osmtogeojson'
// import { GHANA_REGIONS_DATA } from '../lib/ghana-post/data';



interface District {
  code: string;
  name: string;
  region: string;
}

interface Region {
  code: string;
  name: string;
  districts: District[];
}

// /lib/ghana-post/data.ts
export const GHANA_REGIONS_DATA: Region[] = [
  {
      code: 'AH',
      name: 'AHAFO',
      districts: [
          { code: 'HA', name: 'Asunafo North', region: 'AHAFO' },
          { code: 'HB', name: 'Asunafo South', region: 'AHAFO' },
          { code: 'HQ', name: 'Asutifi North', region: 'AHAFO' },
          { code: 'HR', name: 'Asutifi South', region: 'AHAFO' },
          { code: 'HT', name: 'Tano North', region: 'AHAFO' },
          { code: 'HS', name: 'Tano South', region: 'AHAFO' },
      ]
  },
  {
      code: 'A',
      name: 'ASHANTI',
      districts: [
          { code: 'A5', name: 'Adansi Asokwa', region: 'ASHANTI' },
          { code: 'A2', name: 'Adansi North', region: 'ASHANTI' },
          { code: 'A3', name: 'Adansi South', region: 'ASHANTI' },
          { code: 'AF', name: 'Afigya Kwabre', region: 'ASHANTI' },
          { code: 'AAK', name: 'Afigya Kwabre North', region: 'ASHANTI' },
          { code: 'AX', name: 'Ahafo Ano North', region: 'ASHANTI' },
          { code: 'A8', name: 'Ahafo Ano South East', region: 'ASHANTI' },
          { code: 'AY', name: 'Ahafo Ano South West', region: 'ASHANTI' },
          { code: 'AAF', name: 'Akrofuom', region: 'ASHANTI' },
          { code: 'AAC', name: 'Amansie Central', region: 'ASHANTI' },
          { code: 'AAM', name: 'Amansie South', region: 'ASHANTI' },
          { code: 'AAW', name: 'Amansie West', region: 'ASHANTI' },
          { code: 'AC', name: 'Asante Akim Central', region: 'ASHANTI' },
          { code: 'AN', name: 'Asante Akim North', region: 'ASHANTI' },
          { code: 'AA', name: 'Asante Akim South', region: 'ASHANTI' },
          { code: 'AS', name: 'Asokore Mampong', region: 'ASHANTI' },
          { code: 'AAS', name: 'Asokwa', region: 'ASHANTI' },
          { code: 'AG', name: 'Atwima Kwanwoma', region: 'ASHANTI' },
          { code: 'AI', name: 'Atwima Mponua', region: 'ASHANTI' },
          { code: 'AH', name: 'Atwima Nwabiagya', region: 'ASHANTI' },
          { code: 'AAT', name: 'Atwima Nwabiagya North', region: 'ASHANTI' },
          { code: 'AB', name: 'Bekwai', region: 'ASHANTI' },
          { code: 'AT', name: 'Bosomtwe', region: 'ASHANTI' },
          { code: 'AE', name: 'Ejisu', region: 'ASHANTI' },
          { code: 'AJ', name: 'Ejura-Sekyedumase', region: 'ASHANTI' },
          { code: 'AL', name: 'Juaben', region: 'ASHANTI' },
          { code: 'AK', name: 'Kumasi', region: 'ASHANTI' },
          { code: 'AD', name: 'Kwabre East', region: 'ASHANTI' },
          { code: 'AKW', name: 'Kwadaso', region: 'ASHANTI' },
          { code: 'AM', name: 'Mampong', region: 'ASHANTI' },
          { code: 'AO', name: 'Obuasi', region: 'ASHANTI' },
          { code: 'AOE', name: 'Obuasi East', region: 'ASHANTI' },
          { code: 'A6', name: 'Offinso North', region: 'ASHANTI' },
          { code: 'A7', name: 'Offinso South', region: 'ASHANTI' },
          { code: 'AOK', name: 'Oforikrom', region: 'ASHANTI' },
          { code: 'AOT', name: 'Old Tafo', region: 'ASHANTI' },
          { code: 'AP', name: 'Sekyere Afram Plains', region: 'ASHANTI' },
          { code: 'AQ', name: 'Sekyere Central', region: 'ASHANTI' },
          { code: 'AR', name: 'Sekyere East', region: 'ASHANTI' },
          { code: 'AU', name: 'Sekyere Kumawu', region: 'ASHANTI' },
          { code: 'AZ', name: 'Sekyere South', region: 'ASHANTI' },
          { code: 'ASU', name: 'Suame', region: 'ASHANTI' },
      ]
  },
  {
      code: 'BO',
      name: 'BONO',
      districts: [
          { code: 'BA', name: 'Banda', region: 'BONO' },
          { code: 'BB', name: 'Berekum East', region: 'BONO' },
          { code: 'BC', name: 'Berekum West', region: 'BONO' },
          { code: 'BD', name: 'Dormaa Central', region: 'BONO' },
          { code: 'BE', name: 'Dormaa East', region: 'BONO' },
          { code: 'BF', name: 'Dormaa West', region: 'BONO' },
          { code: 'BJ', name: 'Jaman North', region: 'BONO' },
          { code: 'BI', name: 'Jaman South', region: 'BONO' },
          { code: 'BS', name: 'Sunyani', region: 'BONO' },
          { code: 'BY', name: 'Sunyani West', region: 'BONO' },
          { code: 'BZ', name: 'Tain', region: 'BONO' },
          { code: 'BW', name: 'Wenchi', region: 'BONO' },
      ]
  },
  {
      code: 'BE',
      name: 'BONO EAST',
      districts: [
          { code: 'TA', name: 'Atebubu-Amantin', region: 'BONO EAST' },
          { code: 'TK', name: 'Kintampo North', region: 'BONO EAST' },
          { code: 'TL', name: 'Kintampo South', region: 'BONO EAST' },
          { code: 'TN', name: 'Nkoranza North', region: 'BONO EAST' },
          { code: 'TO', name: 'Nkoranza South', region: 'BONO EAST' },
          { code: 'TP', name: 'Pru East', region: 'BONO EAST' },
          { code: 'TW', name: 'Pru West', region: 'BONO EAST' },
          { code: 'TE', name: 'Sene East', region: 'BONO EAST' },
          { code: 'TS', name: 'Sene West', region: 'BONO EAST' },
          { code: 'TT', name: 'Techiman', region: 'BONO EAST' },
          { code: 'TX', name: 'Techiman North', region: 'BONO EAST' },
      ]
  },
  {
      code: 'C',
      name: 'CENTRAL',
      districts: [
          { code: 'CA', name: 'Abura Asebu Kwamankese', region: 'CENTRAL' },
          { code: 'CP', name: 'Agona East', region: 'CENTRAL' },
          { code: 'CO', name: 'Agona West', region: 'CENTRAL' },
          { code: 'CJ', name: 'Ajumako Enyan Esiam', region: 'CENTRAL' },
          { code: 'CB', name: 'Asikuma / Odoben / Brakwa', region: 'CENTRAL' },
          { code: 'CN', name: 'Assin Central', region: 'CENTRAL' },
          { code: 'CR', name: 'Assin North', region: 'CENTRAL' },
          { code: 'CS', name: 'Assin South', region: 'CENTRAL' },
          { code: 'CX', name: 'Awutu Senya East', region: 'CENTRAL' },
          { code: 'CC', name: 'Cape Coast', region: 'CENTRAL' },
          { code: 'CE', name: 'Effutu', region: 'CENTRAL' },
          { code: 'CF', name: 'Ekumfi', region: 'CENTRAL' },
          { code: 'CL', name: 'Gomoa Central', region: 'CENTRAL' },
          { code: 'CG', name: 'Gomoa East', region: 'CENTRAL' },
          { code: 'CI', name: 'Gomoa West', region: 'CENTRAL' },
          { code: 'CH', name: 'Hemang Lower Denkyira', region: 'CENTRAL' },
          { code: 'CK', name: 'Komenda Edina Eguafo', region: 'CENTRAL' },
          { code: 'CM', name: 'Mfantsiman', region: 'CENTRAL' },
          { code: 'CT', name: 'Twifo Ati-Morkwa', region: 'CENTRAL' },
          { code: 'CU', name: 'Upper Denkyira East', region: 'CENTRAL' },
          { code: 'CV', name: 'Upper Denkyira West', region: 'CENTRAL' },
      ]
  },
  {
      code: 'E',
      name: 'EASTERN',
      districts: [
          { code: 'E4', name: 'Abuakwa North', region: 'EASTERN' },
          { code: 'E5', name: 'Abuakwa South', region: 'EASTERN' },
          { code: 'EC', name: 'Achiase', region: 'EASTERN' },
          { code: 'E2', name: 'Akuapem North', region: 'EASTERN' },
          { code: 'E3', name: 'Akuapem South', region: 'EASTERN' },
          { code: 'EM', name: 'Akyemansa', region: 'EASTERN' },
          { code: 'E8', name: 'Asene Manso Akroso', region: 'EASTERN' },
          { code: 'EA', name: 'Asuogyaman', region: 'EASTERN' },
          { code: 'E9', name: 'Atiwa East', region: 'EASTERN' },
          { code: 'E0', name: 'Atiwa West', region: 'EASTERN' },
          { code: 'EP', name: 'Ayensuano', region: 'EASTERN' },
          { code: 'EX', name: 'Birim Central', region: 'EASTERN' },
          { code: 'EX', name: 'Birim North', region: 'EASTERN' },
          { code: 'EZ', name: 'Birim South', region: 'EASTERN' },
          { code: 'ED', name: 'Denkyembour', region: 'EASTERN' },
          { code: 'EF', name: 'Fanteakwa North', region: 'EASTERN' },
          { code: 'EG', name: 'Fanteakwa South', region: 'EASTERN' },
          { code: 'EK', name: 'Kwaebibirem', region: 'EASTERN' },
          { code: 'EP', name: 'Kwahu Afram Plains North', region: 'EASTERN' },
          { code: 'EQ', name: 'Kwahu Afram Plains South', region: 'EASTERN' },
          { code: 'EH', name: 'Kwahu East', region: 'EASTERN' },
          { code: 'EI', name: 'Kwahu South', region: 'EASTERN' },
          { code: 'EJ', name: 'Kwahu West', region: 'EASTERN' },
          { code: 'EL', name: 'Lower Manya Krobo', region: 'EASTERN' },
          { code: 'E7', name: 'New Juaben North', region: 'EASTERN' },
          { code: 'EN', name: 'New Juaben South', region: 'EASTERN' },
          { code: 'EG', name: 'Nsawam Adoagyiri', region: 'EASTERN' },
          { code: 'ER', name: 'Okere', region: 'EASTERN' },
          { code: 'ES', name: 'Suhum', region: 'EASTERN' },
          { code: 'EU', name: 'Upper Manya Krobo', region: 'EASTERN' },
          { code: 'EV', name: 'Upper West Akim', region: 'EASTERN' },
          { code: 'EW', name: 'West Akim', region: 'EASTERN' },
          { code: 'EY', name: 'Yilo Krobo', region: 'EASTERN' },
      ]
  },
  {
      code: 'GA',
      name: 'GREATER ACCRA',
      districts: [
          { code: 'G7', name: 'Ablekuma Central', region: 'GREATER ACCRA' },
          { code: 'GF', name: 'Ablekuma North', region: 'GREATER ACCRA' },
          { code: 'GU', name: 'Ablekuma West', region: 'GREATER ACCRA' },
          { code: 'GA', name: 'Accra', region: 'GREATER ACCRA' },
          { code: 'GY', name: 'Ada East', region: 'GREATER ACCRA' },
          { code: 'GX', name: 'Ada West', region: 'GREATER ACCRA' },
          { code: 'GD', name: 'Adentan', region: 'GREATER ACCRA' },
          { code: 'GB', name: 'Ashaiman', region: 'GREATER ACCRA' },
          { code: 'G2', name: 'Ayawaso Central', region: 'GREATER ACCRA' },
          { code: 'GV', name: 'Ayawaso East', region: 'GREATER ACCRA' },
          { code: 'G3', name: 'Ayawaso North', region: 'GREATER ACCRA' },
          { code: 'G4', name: 'Ayawaso West', region: 'GREATER ACCRA' },
          { code: 'GE', name: 'Ga East', region: 'GREATER ACCRA' },
          { code: 'GG', name: 'Ga North', region: 'GREATER ACCRA' },
          { code: 'GS', name: 'Ga South', region: 'GREATER ACCRA' },
          { code: 'GW', name: 'Ga West', region: 'GREATER ACCRA' },
          { code: 'GR', name: 'Korle Klottey', region: 'GREATER ACCRA' },
          { code: 'GK', name: 'Kpone Katamanso', region: 'GREATER ACCRA' },
          { code: 'G6', name: 'Krowor', region: 'GREATER ACCRA' },
          { code: 'GL', name: 'La Dade Kotopon', region: 'GREATER ACCRA' },
          { code: 'GM', name: 'La Nkwantanang Madina', region: 'GREATER ACCRA' },
          { code: 'GZ', name: 'Ledzokuku', region: 'GREATER ACCRA' },
          { code: 'GN', name: 'Ningo Prampram', region: 'GREATER ACCRA' },
          { code: 'GI', name: 'Okaikwei North', region: 'GREATER ACCRA' },
          { code: 'GO', name: 'Shai-Osudoku', region: 'GREATER ACCRA' },
          { code: 'GT', name: 'Tema', region: 'GREATER ACCRA' },
          { code: 'GQ', name: 'Tema West', region: 'GREATER ACCRA' },
          { code: 'GJ', name: 'Weija Gbawe', region: 'GREATER ACCRA' },
      ]
  },
  {
      code: 'NE',
      name: 'NORTH EAST',
      districts: [
          { code: 'MP', name: 'Bunkpurugu Nakpanduri', region: 'NORTH EAST' },
          { code: 'MC', name: 'Chereponi', region: 'NORTH EAST' },
          { code: 'ME', name: 'East Mamprusi', region: 'NORTH EAST' },
          { code: 'MM', name: 'Mamprugu Moagduri', region: 'NORTH EAST' },
          { code: 'MW', name: 'West Mamprusi', region: 'NORTH EAST' },
          { code: 'MY', name: 'Yunyoo Nasuan', region: 'NORTH EAST' },
      ]
  },
  {
      code: 'N',
      name: 'NORTHERN',
      districts: [
          { code: 'NG', name: 'Gusheigu', region: 'NORTHERN' },
          { code: 'NR', name: 'Karaga', region: 'NORTHERN' },
          { code: 'NA', name: 'Kpandai', region: 'NORTHERN' },
          { code: 'NK', name: 'Kumbungu', region: 'NORTHERN' },
          { code: 'NI', name: 'Mion', region: 'NORTHERN' },
          { code: 'NU', name: 'Nanton', region: 'NORTHERN' },
          { code: 'NN', name: 'Nanumba North', region: 'NORTHERN' },
          { code: 'NO', name: 'Nanumba South', region: 'NORTHERN' },
          { code: 'NX', name: 'Saboba', region: 'NORTHERN' },
          { code: 'NS', name: 'Sagnerigu', region: 'NORTHERN' },
          { code: 'NV', name: 'Savelugu', region: 'NORTHERN' },
          { code: 'NT', name: 'Tamale', region: 'NORTHERN' },
          { code: 'NF', name: 'Tatale Sangule', region: 'NORTHERN' },
          { code: 'NL', name: 'Tolon', region: 'NORTHERN' },
          { code: 'NY', name: 'Yendi', region: 'NORTHERN' },
          { code: 'NZ', name: 'Zabzugu', region: 'NORTHERN' },
      ]
  },
  {
      code: 'O',
      name: 'OTI',
      districts: [
          { code: 'OB', name: 'Biakoye', region: 'OTI' },
          { code: 'OG', name: 'Guan', region: 'OTI' },
          { code: 'OJ', name: 'Jasikan', region: 'OTI' },
          { code: 'OK', name: 'Kadjebi', region: 'OTI' },
          { code: 'OE', name: 'Krachi East', region: 'OTI' },
          { code: 'OQ', name: 'Krachi Nchumuru', region: 'OTI' },
          { code: 'OW', name: 'Krachi West', region: 'OTI' },
          { code: 'ON', name: 'Nkwanta North', region: 'OTI' },
          { code: 'OS', name: 'Nkwanta South', region: 'OTI' },
      ]
  },
  {
      code: 'S',
      name: 'SAVANNAH',
      districts: [
          { code: 'SB', name: 'Bole', region: 'SAVANNAH' },
          { code: 'SG', name: 'Central Gonja', region: 'SAVANNAH' },
          { code: 'SE', name: 'East Gonja', region: 'SAVANNAH' },
          { code: 'SJ', name: 'North East Gonja', region: 'SAVANNAH' },
          { code: 'SN', name: 'North Gonja', region: 'SAVANNAH' },
          { code: 'SS', name: 'Sawla Tuna Kalba', region: 'SAVANNAH' },
          { code: 'SW', name: 'West Gonja', region: 'SAVANNAH' },
      ]
  },
  {
      code: 'UE',
      name: 'UPPER EAST',
      districts: [
          { code: 'UA', name: 'Bawku', region: 'UPPER EAST' },
          { code: 'UW', name: 'Bawku West', region: 'UPPER EAST' },
          { code: 'UU', name: 'Binduri', region: 'UPPER EAST' },
          { code: 'UB', name: 'Bolgatanga', region: 'UPPER EAST' },
          { code: 'UE', name: 'Bolgatanga East', region: 'UPPER EAST' },
          { code: 'UO', name: 'Bongo', region: 'UPPER EAST' },
          { code: 'UR', name: 'Builsa North', region: 'UPPER EAST' },
          { code: 'US', name: 'Builsa South', region: 'UPPER EAST' },
          { code: 'UG', name: 'Garu', region: 'UPPER EAST' },
          { code: 'UK', name: 'Kassena Nankana East', region: 'UPPER EAST' },
          { code: 'UL', name: 'Kassena Nankana West', region: 'UPPER EAST' },
          { code: 'UN', name: 'Nabdam', region: 'UPPER EAST' },
          { code: 'UP', name: 'Pusiga', region: 'UPPER EAST' },
          { code: 'UT', name: 'Talensi', region: 'UPPER EAST' },
          { code: 'UM', name: 'Tempane', region: 'UPPER EAST' },
      ]
  },
  {
      code: 'UW',
      name: 'UPPER WEST',
      districts: [
          { code: 'XD', name: 'Daffiama Bussie Issa', region: 'UPPER WEST' },
          { code: 'XJ', name: 'Jirapa', region: 'UPPER WEST' },
          { code: 'XK', name: 'Lambussie Karni', region: 'UPPER WEST' },
          { code: 'XL', name: 'Lawra', region: 'UPPER WEST' },
          { code: 'XO', name: 'Nadowli Kaleo', region: 'UPPER WEST' },
          { code: 'XN', name: 'Nandom', region: 'UPPER WEST' },
          { code: 'XS', name: 'Sissala East', region: 'UPPER WEST' },
          { code: 'XT', name: 'Sissala West', region: 'UPPER WEST' },
          { code: 'XW', name: 'Wa', region: 'UPPER WEST' },
          { code: 'XX', name: 'Wa East', region: 'UPPER WEST' },
          { code: 'XY', name: 'Wa West', region: 'UPPER WEST' },
      ]
  },
  {
      code: 'V',
      name: 'VOLTA',
      districts: [
          { code: 'VA', name: 'Adaklu', region: 'VOLTA' },
          { code: 'VF', name: 'Afadjato South', region: 'VOLTA' },
          { code: 'VG', name: 'Agotime Ziope', region: 'VOLTA' },
          { code: 'VW', name: 'Akatsi North', region: 'VOLTA' },
          { code: 'VX', name: 'Akatsi South', region: 'VOLTA' },
          { code: 'VN', name: 'Anloga', region: 'VOLTA' },
          { code: 'VV', name: 'Central Tongu', region: 'VOLTA' },
          { code: 'VH', name: 'Ho', region: 'VOLTA' },
          { code: 'VI', name: 'Ho West', region: 'VOLTA' },
          { code: 'VC', name: 'Hohoe', region: 'VOLTA' },
          { code: 'VK', name: 'Keta', region: 'VOLTA' },
          { code: 'VY', name: 'Ketu North', region: 'VOLTA' },
          { code: 'VZ', name: 'Ketu South', region: 'VOLTA' },
          { code: 'VP', name: 'Kpando', region: 'VOLTA' },
          { code: 'VD', name: 'North Dayi', region: 'VOLTA' },
          { code: 'VT', name: 'North Tongu', region: 'VOLTA' },
          { code: 'VE', name: 'South Dayi', region: 'VOLTA' },
          { code: 'VU', name: 'South Tongu', region: 'VOLTA' },
      ]
  },
  {
      code: 'W',
      name: 'WESTERN',
      districts: [
          { code: 'WH', name: 'Ahanta West', region: 'WESTERN' },
          { code: 'WK', name: 'Effia Kwesimintsim', region: 'WESTERN' },
          { code: 'WE', name: 'Ellembele', region: 'WESTERN' },
          { code: 'WJ', name: 'Jomoro', region: 'WESTERN' },
          { code: 'WM', name: 'Mpohor', region: 'WESTERN' },
          { code: 'WN', name: 'Nzema East', region: 'WESTERN' },
          { code: 'WP', name: 'Prestea Huni Valley', region: 'WESTERN' },
          { code: 'WS', name: 'Sekondi-Takoradi', region: 'WESTERN' },
          { code: 'WR', name: 'Shama', region: 'WESTERN' },
          { code: 'WT', name: 'Tarkwa Nsuaem', region: 'WESTERN' },
          { code: 'WW', name: 'Wassa Amenfi Central', region: 'WESTERN' },
          { code: 'WX', name: 'Wassa Amenfi East', region: 'WESTERN' },
          { code: 'WY', name: 'Wassa Amenfi West', region: 'WESTERN' },
          { code: 'WZ', name: 'Wassa East', region: 'WESTERN' },
      ]
  },
  {
      code: 'WN',
      name: 'WESTERN NORTH',
      districts: [
          { code: 'YA', name: 'Aowin', region: 'WESTERN NORTH' },
          { code: 'YE', name: 'Bia East', region: 'WESTERN NORTH' },
          { code: 'YW', name: 'Bia West', region: 'WESTERN NORTH' },
          { code: 'YB', name: 'Bibiani Anhwiaso Bekwai', region: 'WESTERN NORTH' },
          { code: 'YD', name: 'Bodi', region: 'WESTERN NORTH' },
          { code: 'YJ', name: 'Juaboso', region: 'WESTERN NORTH' },
          { code: 'YK', name: 'Sefwi Akontombra', region: 'WESTERN NORTH' },
          { code: 'YS', name: 'Sefwi Wiawso', region: 'WESTERN NORTH' },
          { code: 'YU', name: 'Suaman', region: 'WESTERN NORTH' },
      ]
  }
];



interface District {
  code: string;
  name: string;
  region: string;
}

interface Region {
  code: string;
  name: string;
  districts: District[];
}

interface GeoJSONFeature {
  type: string;
  properties: {
    name?: string;
    admin_level?: string;
    [key: string]: string | number | boolean | null | undefined;
  } | null;
  geometry: GeoJSON.Geometry;
}

/**
 * Comprehensive mapping dictionary with normalized keys
 */
const DISTRICT_MAPPINGS: Record<string, string> = {
  // Base mappings
  'ada east': 'ada east',
  'ga east': 'ga east',
  'ga central': 'ga central',
  'ga north': 'ga north',
  'ga south': 'ga south',
  'ga west': 'ga west',
  'kassena nankana': 'kassena nankana east',
  'krachi east': 'krachi east',
  'krachi west': 'krachi west',
  'krachi nchumuru': 'krachi nchumuru',
  'nkwanta north': 'nkwanta north',
  'nkwanta south': 'nkwanta south',
  'builsa north': 'builsa north',
  'builsa south': 'builsa south',
  'sissala east': 'sissala east',
  'sissala west': 'sissala west',
  'ayawaso east': 'ayawaso east',
  'ayawaso west': 'ayawaso west',
  'ayawaso north': 'ayawaso north',
  'ayawaso central': 'ayawaso central',
  'ablekuma central': 'ablekuma central',
  'ablekuma north': 'ablekuma north',
  'ablekuma west': 'ablekuma west',
  'nanumba north': 'nanumba north',
  'nanumba south': 'nanumba south',
  'asante akim': 'asante akim central',
  'amansie south': 'amansie south',
  'amansie west': 'amansie west',
  'ahafo ano south': 'ahafo ano south east',
  'adansi north': 'adansi north',
  'adansi south': 'adansi south',

  // Enhanced mappings
  'adenta': 'adentan',
  'bassar': 'tatale sangule',
  'gushiegu': 'gushegu',
  'gushiegu municipal': 'gushegu',
  'sagnarigu': 'sagnerigu',
  'mamprugo moaduri': 'mamprugu moagduri',
  'afadzato south': 'afadjato south',
  'ajumako enyan essiam': 'ajumako enyan esiam',
  'awutu senya west': 'awutu senya east',
  'twifo hemang lower denkyira': 'hemang lower denkyira',
  'komenda edina eguafo abirem': 'komenda edina eguafo',
  'twifo atti morkwa': 'twifo ati morkwa',
  'amenfi central': 'wassa amenfi central',
  'amenfi west': 'wassa amenfi west',
  'ellembelle': 'ellembele',
  'akuapim north': 'akuapem north',
  'akuapim south': 'akuapem south',
  'nsawam adoagyire': 'nsawam adoagyiri',
  'offinso': 'offinso south',
  'bosome freho': 'bosome freho',
  'afigya kwabre south': 'afigya kwabre',
  
  // Special area and subdivision mappings
  'prefecture de kpendjal': 'kpendjal',
  'victoriaborg': 'accra',
  'victoriaborg south la estate': 'la dade kotopon',
  'victoriaborg james town': 'accra',
  'ussher town': 'accra',
  'kwashieman ofankor': 'accra',
  'kwashieman ofankor road': 'accra',
  'la estate': 'la dade kotopon',
  'south la estate': 'la dade kotopon',
  'accra central': 'accra',
  'accra metropolitan': 'accra',
  'tema metropolitan': 'tema',
  'tema municipal': 'tema',
  'kumasi metropolitan': 'kumasi',
  'sekondi takoradi metropolitan': 'sekondi takoradi',
  'tamale metropolitan': 'tamale',
  
  // Additional mappings for problematic cases
  'ga central municipal': 'ga central',
  'james town': 'accra',
  'central accra': 'accra',
  'north accra': 'accra',
  'east accra': 'accra',
  'west accra': 'accra',
  'south accra': 'accra'
};

/**
 * Enhanced normalization function with improved handling of special cases
 */
function normalizeDistrictName(name: string): string {
  // First pass normalization
  const normalized = name
    .toLowerCase()
    // Remove administrative terms and variations
    .replace(/(municipal(ity)?|metropolitan|district|mun\.?|met\.?|prefecture(\sde)?)/g, '')
    // Replace special characters with spaces
    .replace(/[\/\-\.]/g, ' ')
    // Remove multiple spaces
    .replace(/\s+/g, ' ')
    // Remove common words and connectors
    .replace(/\b(the|of|and|de)\b/g, '')
    // Remove accents
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Check special mappings first
  const specialCase = DISTRICT_MAPPINGS[normalized];
  if (specialCase) {
    return specialCase;
  }

  // Handle compound names
  const parts = normalized.split(' ');
  
  // Generate variations for matching
  const variations = [
    normalized,
    parts.join(' '),
    // Try without directional prefixes
    parts.filter(p => !['north', 'south', 'east', 'west', 'central'].includes(p)).join(' ')
  ];

  // Check all variations against mappings
  for (const variation of variations) {
    if (DISTRICT_MAPPINGS[variation]) {
      return DISTRICT_MAPPINGS[variation];
    }
  }

  // If no matches found, try reorganizing directional modifiers
  const directions = ['north', 'south', 'east', 'west', 'central'];
  if (parts.length > 1) {
    const firstWord = parts[0];
    if (directions.includes(firstWord)) {
      const restOfName = parts.slice(1).join(' ');
      const rearranged = `${restOfName} ${firstWord}`;
      if (DISTRICT_MAPPINGS[rearranged]) {
        return DISTRICT_MAPPINGS[rearranged];
      }
    }
  }

  return normalized;
}

/**
 * Fuzzy matching function for finding close matches
 */
function findClosestMatch(normalizedName: string, districtMap: Map<string, { district: District; region: Region }>): string | null {
  // Direct match
  if (districtMap.has(normalizedName)) {
    return normalizedName;
  }

  // Try without common prefixes/suffixes
  const simpleName = normalizedName
    .replace(/^(north|south|east|west|central)\s+/, '')
    .replace(/\s+(north|south|east|west|central)$/, '');
  
  if (districtMap.has(simpleName)) {
    return simpleName;
  }

  // Try matching the start of the name
  for (const [key] of districtMap) {
    if (key.startsWith(simpleName) || simpleName.startsWith(key)) {
      return key;
    }
  }

  // Try finding partial matches
  const partialMatches = Array.from(districtMap.keys())
    .filter(key => key.includes(simpleName) || simpleName.includes(key));
  
  if (partialMatches.length === 1) {
    return partialMatches[0];
  }

  return null;
}

/**
 * Downloads OSM data using Overpass API
 */
async function downloadOSMData() {
  const query = `
    [out:json][timeout:25];
    area["ISO3166-1"="GH"]->.ghana;
    (
      relation["admin_level"="6"]["boundary"="administrative"](area.ghana);
      way["admin_level"="6"]["boundary"="administrative"](area.ghana);
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    console.log('Sending request to Overpass API...');
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Data received from Overpass API');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error downloading OSM data:', error);
    throw error;
  }
}

/**
 * Main processing function
 */
async function processOSMData() {
  try {
    console.log('Starting OSM data download...');
    const osmData = await downloadOSMData();

    console.log('Converting to GeoJSON...');
    const geojson = osmtogeojson(osmData) as GeoJSON.FeatureCollection;;

    // Build lookup maps
    const districtMap = new Map<string, { district: District; region: Region }>();
    const normalizedMap = new Map<string, string[]>();

    // Initialize maps with all possible variations
    GHANA_REGIONS_DATA.forEach(region => {
      region.districts.forEach(district => {
        const normalizedName = normalizeDistrictName(district.name);
        districtMap.set(normalizedName, { district, region });
        
        // Save original names for debugging
        const existing = normalizedMap.get(normalizedName) || [];
        existing.push(district.name);
        normalizedMap.set(normalizedName, existing);
        
        // Add variations to the map
        const variations = [
          district.name.toLowerCase(),
          district.name.toLowerCase().replace(/\s+/g, ''),
          normalizedName.replace(/\s+/g, '')
        ];
        
        variations.forEach(variant => {
          if (!districtMap.has(variant)) {
            districtMap.set(variant, { district, region });
          }
        });
      });
    });

    console.log('Processing features...');
    const processedFeatures = geojson.features
      .filter((feature: GeoJSONFeature) =>
        feature.properties &&
        feature.properties.admin_level === '6' &&
        feature.properties.name
      )
      .map((feature: GeoJSONFeature) => {
        const rawName = feature.properties?.name || '';
        const normalizedName = normalizeDistrictName(rawName);
        
        // Try exact match first
        let match = districtMap.get(normalizedName);
        
        // If no match, try fuzzy matching
        if (!match) {
          const closestMatch = findClosestMatch(normalizedName, districtMap);
          if (closestMatch) {
            match = districtMap.get(closestMatch);
          }
        }

        if (!match) {
          // Log detailed debugging information for unmatched districts
          console.warn(
            `No matching district found for: ${rawName}\n` +
            `  Normalized: ${normalizedName}\n` +
            `  Possible matches: ${Array.from(districtMap.keys())
              .filter(k => k.includes(normalizedName) || normalizedName.includes(k))
              .join(', ') || 'none'}\n`
          );
          return null;
        }

        return {
          type: 'Feature',
          properties: {
            districtCode: match.district.code,
            districtName: match.district.name,
            regionCode: match.region.code,
            regionName: match.region.name,
            originalName: rawName,
            normalizedName: normalizedName // Adding for debugging
          },
          geometry: feature.geometry
        };
      })
      .filter(Boolean);

    const output = {
      type: 'FeatureCollection',
      features: processedFeatures
    };

    // Log matching statistics
    console.log('\nMatching Statistics:');
    console.log(`Total OSM districts found: ${geojson.features.length}`);
    console.log(`Successfully matched districts: ${processedFeatures.length}`);
    console.log(`Match rate: ${((processedFeatures.length / geojson.features.length) * 100).toFixed(2)}%\n`);

    // Save the output
    const outputDir = path.join(__dirname, '../lib/ghana-post/data/districts');
    // const outputDir = path.join(__dirname, '../lib/ghana-post/data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'district-boundaries.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`Processing complete! Data saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error processing OSM data:', error);
    process.exit(1);
  }
}

// Execute the script
processOSMData();




