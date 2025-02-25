import fs from 'fs';
import path from 'path';
import osmtogeojson from 'osmtogeojson';
// import { GHANA_REGIONS_DATA } from '@/lib/ghana-post/data';


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

const GHANA_REGIONS_DATA: Region[] = [
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



interface Locality {
  name: string;
  type: 'city' | 'town' | 'suburb' | 'village' | 'neighborhood';
  districtCode: string;
  regionCode: string;
  boundary?: GeoJSON.Geometry; // Optional boundary geometry
}

interface LocalityCollection {
  [districtCode: string]: {
    district: string;
    region: string;
    localities: Locality[];
  };
}

async function downloadLocalitiesData() {
  const query = `
    [out:json][timeout:300];
    area["ISO3166-1"="GH"]->.ghana;
    (
      // Fetch localities
      node["place"~"city|town|suburb|village|neighbourhood|residential"](area.ghana);
      way["place"~"city|town|suburb|village|neighbourhood|residential"](area.ghana);
      relation["place"~"city|town|suburb|village|neighbourhood|residential"](area.ghana);

      // Fetch district boundaries
      relation["admin_level"="6"]["boundary"="administrative"](area.ghana);
      way["admin_level"="6"]["boundary"="administrative"](area.ghana);
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    console.log('Fetching localities data from Overpass API...');
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

    console.log('Localities data received from Overpass API');
    return await response.json();
  } catch (error) {
    console.error('Error downloading localities data:', error);
    throw error;
  }
}

function normalizeLocalityName(name: string): string {
  return name
    .replace(/\b(town|city|village|suburb|neighborhood|area|community)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Tags {
  place?: string;
}

function determineLocalityType(tags: Tags): 'city' | 'town' | 'suburb' | 'village' | 'neighborhood' {
  const place = tags.place;
  switch (place) {
    case 'city':
      return 'city';
    case 'town':
      return 'town';
    case 'suburb':
      return 'suburb';
    case 'village':
      return 'village';
    case 'neighbourhood':
    case 'residential':
      return 'neighborhood';
    default:
      return 'neighborhood';
  }
}

function getCentroid(geometry: GeoJSON.Geometry): number[] {
  let x = 0;
  let y = 0;
  let count = 0;

  function processCoordinates(coords: number[]) {
    x += coords[0];
    y += coords[1];
    count++;
  }

  function processGeometry(geom: GeoJSON.Geometry) {
    if (geom.type === 'Point') {
      processCoordinates(geom.coordinates as number[]);
    } else if (geom.type === 'Polygon') {
      (geom.coordinates as GeoJSON.Position[][]).forEach(ring => ring.forEach(processCoordinates));
    } else if (geom.type === 'MultiPolygon') {
      (geom.coordinates as GeoJSON.Position[][][]).forEach(polygon => polygon.forEach(ring => ring.forEach(processCoordinates)));
    }
  }

  processGeometry(geometry);

  return [x / count, y / count];
}

function getBoundingBox(geometry: GeoJSON.Geometry) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  function processCoordinates(coords: number[]) {
    minX = Math.min(minX, coords[0]);
    minY = Math.min(minY, coords[1]);
    maxX = Math.max(maxX, coords[0]);
    maxY = Math.max(maxY, coords[1]);
  }

  function processGeometry(geom: GeoJSON.Geometry) {
    if (geom.type === 'Point') {
      processCoordinates(geom.coordinates as number[]);
    } else if (geom.type === 'Polygon') {
      (geom.coordinates as GeoJSON.Position[][]).forEach(ring => ring.forEach(processCoordinates));
    } else if (geom.type === 'MultiPolygon') {
      (geom.coordinates as GeoJSON.Position[][][]).forEach(polygon => polygon.forEach(ring => ring.forEach(processCoordinates)));
    }
  }

  processGeometry(geometry);

  return { minX, minY, maxX, maxY };
}

async function processLocalitiesData() {
  try {
    const districtBoundariesPath = path.join(__dirname, '../lib/ghana-post/data/district-boundaries.json');
    const districtBoundaries = JSON.parse(fs.readFileSync(districtBoundariesPath, 'utf-8'));

    const osmData = await downloadLocalitiesData();
    const geojson = osmtogeojson(osmData) as GeoJSON.FeatureCollection;;

    const localities: LocalityCollection = {};
    GHANA_REGIONS_DATA.forEach(region => {
      region.districts.forEach(district => {
        localities[district.code] = {
          district: district.name,
          region: region.name,
          localities: []
        };
      });
    });

    console.log('Processing localities...');
    for (const feature of geojson.features) {
      if (!feature.properties || !feature.properties.name) continue;

      const name = normalizeLocalityName(feature.properties.name);
      const type = determineLocalityType(feature.properties);

      // Check if the feature has boundary data
      const hasBoundary = feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon';

      let point = null;
      if (feature.geometry.type === 'Point') {
        point = feature.geometry.coordinates;
      } else if (hasBoundary) {
        point = getCentroid(feature.geometry);
      }

      if (!point) continue;

      const containingDistrict = districtBoundaries.features.find((district: { geometry: GeoJSON.Geometry; properties: { districtCode: string; regionCode: string; } }) => {
        const bounds = getBoundingBox(district.geometry);
        return point[0] >= bounds.minX && point[0] <= bounds.maxX &&
               point[1] >= bounds.minY && point[1] <= bounds.maxY;
      });

      if (containingDistrict) {
        const { districtCode, regionCode } = containingDistrict.properties;
        if (localities[districtCode]) {
          localities[districtCode].localities.push({
            name,
            type,
            districtCode,
            regionCode,
            boundary: hasBoundary ? feature.geometry : undefined
          });
        }
      }
    }

    // Save the processed data
    const outputDir = path.join(__dirname, '../lib/ghana-post/data/localities/one/two');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'localities.json');
    fs.writeFileSync(outputPath, JSON.stringify(localities, null, 2));

    console.log('\nProcessing complete! Data saved to:', outputPath);
  } catch (error) {
    console.error('Error processing localities data:', error);
    process.exit(1);
  }
}

// Execute the script
processLocalitiesData();


// interface Locality {
//   name: string;
//   type: 'city' | 'town' | 'suburb' | 'village' | 'neighborhood';
//   districtCode: string;
//   regionCode: string;
//   boundary?: GeoJSON.Geometry; // Optional boundary geometry
// }

// interface LocalityCollection {
//   [districtCode: string]: {
//     district: string;
//     region: string;
//     localities: Locality[];
//   };
// }

// async function downloadLocalitiesData() {
//   const query = `
//     [out:json][timeout:300];
//     area["ISO3166-1"="GH"]->.ghana;
//     (
//       // Fetch localities
//       node["place"~"city|town|suburb|village|neighbourhood|residential"](area.ghana);
//       way["place"~"city|town|suburb|village|neighbourhood|residential"](area.ghana);
//       relation["place"~"city|town|suburb|village|neighbourhood|residential"](area.ghana);

//       // Fetch district boundaries
//       relation["admin_level"="6"]["boundary"="administrative"](area.ghana);
//       way["admin_level"="6"]["boundary"="administrative"](area.ghana);
//     );
//     out body;
//     >;
//     out skel qt;
//   `;

//   try {
//     console.log('Fetching localities data from Overpass API...');
//     const response = await fetch('https://overpass-api.de/api/interpreter', {
//       method: 'POST',
//       body: query,
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     console.log('Localities data received from Overpass API');
//     return await response.json();
//   } catch (error) {
//     console.error('Error downloading localities data:', error);
//     throw error;
//   }
// }

// function normalizeLocalityName(name: string): string {
//   return name
//     .replace(/\b(town|city|village|suburb|neighborhood|area|community)\b/gi, '')
//     .replace(/\s+/g, ' ')
//     .trim();
// }

// interface Tags {
//   place?: string;
// }

// function determineLocalityType(tags: Tags): 'city' | 'town' | 'suburb' | 'village' | 'neighborhood' {
//   const place = tags.place;
//   switch (place) {
//     case 'city':
//       return 'city';
//     case 'town':
//       return 'town';
//     case 'suburb':
//       return 'suburb';
//     case 'village':
//       return 'village';
//     case 'neighbourhood':
//     case 'residential':
//       return 'neighborhood';
//     default:
//       return 'neighborhood';
//   }
// }

// function getCentroid(geometry: GeoJSON.Geometry): number[] {
//   let x = 0;
//   let y = 0;
//   let count = 0;

//   function processCoordinates(coords: number[]) {
//     x += coords[0];
//     y += coords[1];
//     count++;
//   }

//   function processGeometry(geom: GeoJSON.Geometry) {
//     if (geom.type === 'Point') {
//       processCoordinates(geom.coordinates as number[]);
//     } else if (geom.type === 'Polygon') {
//       (geom.coordinates as GeoJSON.Position[][]).forEach(ring => ring.forEach(processCoordinates));
//     } else if (geom.type === 'MultiPolygon') {
//       (geom.coordinates as GeoJSON.Position[][][]).forEach(polygon => polygon.forEach(ring => ring.forEach(processCoordinates)));
//     }
//   }

//   processGeometry(geometry);

//   return [x / count, y / count];
// }

// function getBoundingBox(geometry: GeoJSON.Geometry) {
//   let minX = Infinity;
//   let minY = Infinity;
//   let maxX = -Infinity;
//   let maxY = -Infinity;

//   function processCoordinates(coords: number[]) {
//     minX = Math.min(minX, coords[0]);
//     minY = Math.min(minY, coords[1]);
//     maxX = Math.max(maxX, coords[0]);
//     maxY = Math.max(maxY, coords[1]);
//   }

//   function processGeometry(geom: GeoJSON.Geometry) {
//     if (geom.type === 'Point') {
//       processCoordinates(geom.coordinates as number[]);
//     } else if (geom.type === 'Polygon') {
//       (geom.coordinates as GeoJSON.Position[][]).forEach(ring => ring.forEach(processCoordinates));
//     } else if (geom.type === 'MultiPolygon') {
//       (geom.coordinates as GeoJSON.Position[][][]).forEach(polygon => polygon.forEach(ring => ring.forEach(processCoordinates)));
//     }
//   }

//   processGeometry(geometry);

//   return { minX, minY, maxX, maxY };
// }

// async function processLocalitiesData() {
//   try {
//     const districtBoundariesPath = path.join(__dirname, '../lib/ghana-post/data/district-boundaries.json');
//     const districtBoundaries = JSON.parse(fs.readFileSync(districtBoundariesPath, 'utf-8'));

//     const osmData = await downloadLocalitiesData();
//     const geojson = osmtogeojson(osmData);

//     const localities: LocalityCollection = {};
//     GHANA_REGIONS_DATA.forEach(region => {
//       region.districts.forEach(district => {
//         localities[district.code] = {
//           district: district.name,
//           region: region.name,
//           localities: []
//         };
//       });
//     });

//     console.log('Processing localities...');
//     for (const feature of geojson.features) {
//       if (!feature.properties || !feature.properties.name) continue;

//       const name = normalizeLocalityName(feature.properties.name);
//       const type = determineLocalityType(feature.properties);

//       // Check if the feature is a boundary
//       const isBoundary = feature.properties.boundary === 'administrative' && feature.properties.admin_level === '6';

//       let point = null;
//       if (feature.geometry.type === 'Point') {
//         point = feature.geometry.coordinates;
//       } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
//         point = getCentroid(feature.geometry);
//       }

//       if (!point) continue;

//       const containingDistrict = districtBoundaries.features.find((district: { geometry: GeoJSON.Geometry; properties: { districtCode: string; regionCode: string; } }) => {
//         const bounds = getBoundingBox(district.geometry);
//         return point[0] >= bounds.minX && point[0] <= bounds.maxX &&
//                point[1] >= bounds.minY && point[1] <= bounds.maxY;
//       });

//       if (containingDistrict) {
//         const { districtCode, regionCode } = containingDistrict.properties;
//         if (localities[districtCode]) {
//           localities[districtCode].localities.push({
//             name,
//             type,
//             districtCode,
//             regionCode,
//             boundary: isBoundary ? feature.geometry : undefined
//           });
//         }
//       }
//     }

//     // Save the processed data
//     const outputDir = path.join(__dirname, '../lib/ghana-post/data/localities/one');
//     if (!fs.existsSync(outputDir)) {
//       fs.mkdirSync(outputDir, { recursive: true });
//     }

//     const outputPath = path.join(outputDir, 'localities.json');
//     fs.writeFileSync(outputPath, JSON.stringify(localities, null, 2));

//     console.log('\nProcessing complete! Data saved to:', outputPath);
//   } catch (error) {
//     console.error('Error processing localities data:', error);
//     process.exit(1);
//   }
// }

// // Execute the script
// processLocalitiesData();


// interface Locality {
//   name: string;
//   type: 'city' | 'town' | 'suburb' | 'village' | 'neighborhood';
//   districtCode: string;
//   regionCode: string;
//   boundary?: GeoJSON.Geometry; // Optional boundary geometry
// }

// interface LocalityCollection {
//   [districtCode: string]: {
//     district: string;
//     region: string;
//     localities: Locality[];
//   };
// }

// async function downloadLocalitiesData() {
//   // This query gets all localities in Ghana with different place types and their boundaries
//   const query = `
//     [out:json][timeout:300];
//     area["ISO3166-1"="GH"]->.ghana;
//     (
//       // Cities and towns
//       node["place"="city"](area.ghana);
//       way["place"="city"](area.ghana);
//       relation["place"="city"](area.ghana);
//       node["place"="town"](area.ghana);
//       way["place"="town"](area.ghana);
//       relation["place"="town"](area.ghana);
//       // Suburbs
//       node["place"="suburb"](area.ghana);
//       way["place"="suburb"](area.ghana);
//       relation["place"="suburb"](area.ghana);
//       // Villages
//       node["place"="village"](area.ghana);
//       way["place"="village"](area.ghana);
//       relation["place"="village"](area.ghana);
//       // Neighborhoods
//       node["place"="neighbourhood"](area.ghana);
//       way["place"="neighbourhood"](area.ghana);
//       relation["place"="neighbourhood"](area.ghana);
//       node["place"="residential"](area.ghana);
//       way["place"="residential"](area.ghana);
//       relation["place"="residential"](area.ghana);
//     );
//     out body;
//     >;
//     out skel qt;
//   `;

//   try {
//     console.log('Fetching localities data from Overpass API...');
//     const response = await fetch('https://overpass-api.de/api/interpreter', {
//       method: 'POST',
//       body: query,
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded'
//       }
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     console.log('Localities data received from Overpass API');
//     return await response.json();
//   } catch (error) {
//     console.error('Error downloading localities data:', error);
//     throw error;
//   }
// }

// interface Tags {
//   place?: string;
// }

// function determineLocalityType(tags: Tags): 'city' | 'town' | 'suburb' | 'village' | 'neighborhood' {
//   const place = tags.place;
//   switch (place) {
//     case 'city':
//       return 'city';
//     case 'town':
//       return 'town';
//     case 'suburb':
//       return 'suburb';
//     case 'village':
//       return 'village';
//     case 'neighbourhood':
//     case 'residential':
//       return 'neighborhood';
//     default:
//       return 'neighborhood';
//   }
// }

// function normalizeLocalityName(name: string): string {
//   return name
//     .replace(/\b(town|city|village|suburb|neighborhood|area|community)\b/gi, '')
//     .replace(/\s+/g, ' ')
//     .trim();
// }

// async function processLocalitiesData() {
//   try {
//     // Load district boundaries
//     const districtBoundariesPath = path.join(__dirname, '../lib/ghana-post/data/district-boundaries.json');
//     const districtBoundaries = JSON.parse(fs.readFileSync(districtBoundariesPath, 'utf-8'));
    
//     // Download localities data
//     const osmData = await downloadLocalitiesData();
//     const geojson = osmtogeojson(osmData);

//     // Initialize localities collection
//     const localities: LocalityCollection = {};
//     GHANA_REGIONS_DATA.forEach(region => {
//       region.districts.forEach(district => {
//         localities[district.code] = {
//           district: district.name,
//           region: region.name,
//           localities: []
//         };
//       });
//     });

//     // Process each locality feature
//     console.log('Processing localities...');
//     for (const feature of geojson.features) {
//       if (!feature.properties || !feature.properties.name) continue;

//       const name = normalizeLocalityName(feature.properties.name);
//       const type = determineLocalityType(feature.properties);
      
//       // Find which district this locality belongs to
//       let point = null;
//       if (feature.geometry.type === 'Point') {
//         point = feature.geometry.coordinates;
//       } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
//         // Use the centroid for polygon features
//         point = getCentroid(feature.geometry);
//       }

//       if (!point) continue;

//       // Find containing district
//       const containingDistrict = districtBoundaries.features.find((district: { geometry: GeoJSON.Geometry; properties: { districtCode: string; regionCode: string; } }) => {
//         // Implement point-in-polygon check here
//         // For simplicity, you might want to use a library like @turf/boolean-point-in-polygon
//         // This is a simplified example
//         const bounds = getBoundingBox(district.geometry);
//         return point[0] >= bounds.minX && point[0] <= bounds.maxX &&
//                point[1] >= bounds.minY && point[1] <= bounds.maxY;
//       });

//       if (containingDistrict) {
//         const { districtCode, regionCode } = containingDistrict.properties;
//         if (localities[districtCode]) {
//           localities[districtCode].localities.push({
//             name,
//             type,
//             districtCode,
//             regionCode,
//             boundary: feature.geometry.type !== 'Point' ? feature.geometry : undefined
//           });
//         }
//       }
//     }

//     // Remove duplicates and sort
//     Object.keys(localities).forEach(districtCode => {
//       localities[districtCode].localities = Array.from(
//         new Map(
//           localities[districtCode].localities.map(item => [item.name, item])
//         ).values()
//       ).sort((a, b) => a.name.localeCompare(b.name));
//     });

//     // Save the processed data
//     const outputDir = path.join(__dirname, '../lib/ghana-post/data/localities');
//     if (!fs.existsSync(outputDir)) {
//       fs.mkdirSync(outputDir, { recursive: true });
//     }

//     const outputPath = path.join(outputDir, 'localities.json');
//     fs.writeFileSync(outputPath, JSON.stringify(localities, null, 2));

//     // Log statistics
//     console.log('\nLocalities Processing Statistics:');
//     let totalLocalities = 0;
//     Object.values(localities).forEach(district => {
//       totalLocalities += district.localities.length;
//     });
//     console.log(`Total districts processed: ${Object.keys(localities).length}`);
//     console.log(`Total localities found: ${totalLocalities}`);

//     console.log(`\nProcessing complete! Data saved to: ${outputPath}`);
//   } catch (error) {
//     console.error('Error processing localities data:', error);
//     process.exit(1);
//   }
// }

// // Helper function to get bounding box of a geometry
// function getBoundingBox(geometry: GeoJSON.Geometry) {
//   let minX = Infinity;
//   let minY = Infinity;
//   let maxX = -Infinity;
//   let maxY = -Infinity;

//   function processCoordinates(coords: number[]) {
//     minX = Math.min(minX, coords[0]);
//     minY = Math.min(minY, coords[1]);
//     maxX = Math.max(maxX, coords[0]);
//     maxY = Math.max(maxY, coords[1]);
//   }

//   function processGeometry(geom: GeoJSON.Geometry) {
//     if (geom.type === 'Point') {
//       processCoordinates(geom.coordinates as number[]);
//     } else if (geom.type === 'Polygon') {
//       (geom.coordinates as GeoJSON.Position[][]).forEach(ring => ring.forEach(processCoordinates));
//     } else if (geom.type === 'MultiPolygon') {
//       (geom.coordinates as GeoJSON.Position[][][]).forEach(polygon => polygon.forEach(ring => ring.forEach(processCoordinates)));
//     }
//   }

//   processGeometry(geometry);

//   return { minX, minY, maxX, maxY };
// }

// // Helper function to get centroid of a geometry
// function getCentroid(geometry: GeoJSON.Geometry): number[] {
//   let x = 0;
//   let y = 0;
//   let count = 0;

//   function processCoordinates(coords: number[]) {
//     x += coords[0];
//     y += coords[1];
//     count++;
//   }

//   function processGeometry(geom: GeoJSON.Geometry) {
//     if (geom.type === 'Point') {
//       processCoordinates(geom.coordinates as number[]);
//     } else if (geom.type === 'Polygon') {
//       (geom.coordinates as GeoJSON.Position[][]).forEach(ring => ring.forEach(processCoordinates));
//     } else if (geom.type === 'MultiPolygon') {
//       (geom.coordinates as GeoJSON.Position[][][]).forEach(polygon => polygon.forEach(ring => ring.forEach(processCoordinates)));
//     }
//   }

//   processGeometry(geometry);

//   return [x / count, y / count];
// }

// // Execute the script
// processLocalitiesData();

// // Export the interfaces for use in other files
// export interface GhanaLocalities {
//   localities: LocalityCollection;
// }