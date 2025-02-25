// scripts/save-postcodes.ts

// import { savePostcodesToDatabase } from '../lib/ghana-post/services/db-service';



// import { generateGhanaPostcodes } from '@/lib/generate-post-codes';
import { PrismaClient } from '@prisma/client';


// import { GHANA_REGIONS_DATA } from '@/data';
import localitiesData from '../lib/ghana-post/data/localities.json';


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


interface Locality {
  name: string;
  type: 'city' | 'town' | 'suburb' | 'village' | 'neighborhood';
  districtCode: string;
  regionCode: string;
}

interface LocalityCollection {
  [districtCode: string]: {
    district: string;
    region: string;
    localities: Locality[];
  };
}

interface PostcodeLocality {
  name: string;
  type: string;
  code: string;
  postcode: string;
}

interface PostcodeDistrict {
  name: string;
  code: string;
  postcode: string;
  localities: PostcodeLocality[];
}

interface PostcodeRegion {
  name: string;
  code: string;
  districts: PostcodeDistrict[];
}

interface PostcodeData {
  regions: PostcodeRegion[];
}

class PostcodeGenerator {
  private localities: LocalityCollection;
  private postcodeData: PostcodeData = { regions: [] };

  constructor() {
    // Use the imported localities data
    this.localities = localitiesData as LocalityCollection;
  }

  private padNumber(num: number, length: number): string {
    return num.toString().padStart(length, '0');
  }

  private generateDistrictCode(regionCode: string, districtIndex: number): string {
    return this.padNumber(districtIndex + 1, 2);
  }

  private generateLocalityCode(districtCode: string, localityIndex: number): string {
    return this.padNumber(localityIndex + 1, 2);
  }

  private generatePostcode(regionCode: string, districtCode: string, localityCode: string): string {
    return `${regionCode} ${districtCode}${localityCode}`;
  }

  public generatePostcodes(): PostcodeData {
    this.postcodeData = { regions: [] };

    // Process each region
    GHANA_REGIONS_DATA.forEach(region => {
      const postcodeRegion: PostcodeRegion = {
        name: region.name,
        code: region.code,
        districts: []
      };

      // Process districts within the region
      region.districts.forEach((district, districtIndex) => {
        const districtData = this.localities[district.code];
        
        const districtCode = this.generateDistrictCode(region.code, districtIndex);
        const postcodeDistrict: PostcodeDistrict = {
          name: district.name,
          code: districtCode,
          postcode: `${region.code} ${districtCode}00`,
          localities: []
        };

        // If we have locality data, process it
        if (districtData?.localities) {
          districtData.localities.forEach((locality, localityIndex) => {
            const localityCode = this.generateLocalityCode(districtCode, localityIndex);
            const postcode = this.generatePostcode(region.code, districtCode, localityCode);

            const postcodeLocality: PostcodeLocality = {
              name: locality.name,
              type: locality.type,
              code: localityCode,
              postcode
            };

            postcodeDistrict.localities.push(postcodeLocality);
          });
        }

        postcodeRegion.districts.push(postcodeDistrict);
      });

      this.postcodeData.regions.push(postcodeRegion);
    });

    return this.postcodeData;
  }

  public lookupPostcode(postcode: string): {
    region: string;
    district: string;
    locality?: string;
    postcode: string;
  } | null {
    const [regionCode, localCode] = postcode.split(' ');
    if (!regionCode || !localCode || localCode.length !== 4) {
      return null;
    }

    const districtCode = localCode.substring(0, 2);
    const localityCode = localCode.substring(2, 4);

    const region = this.postcodeData.regions.find(r => r.code === regionCode);
    if (!region) return null;

    const district = region.districts.find(d => d.code === districtCode);
    if (!district) return null;

    // Handle district-level postcodes (ending in 00)
    if (localityCode === '00') {
      return {
        region: region.name,
        district: district.name,
        postcode: district.postcode
      };
    }

    const locality = district.localities.find(l => l.code === localityCode);
    if (!locality) return null;

    return {
      region: region.name,
      district: district.name,
      locality: locality.name,
      postcode: locality.postcode
    };
  }

  public validatePostcode(postcode: string): boolean {
    const postcodeRegex = /^[A-Z]{1,2}\s\d{4}$/;
    if (!postcodeRegex.test(postcode)) {
      return false;
    }
    return this.lookupPostcode(postcode) !== null;
  }
}

// Create a singleton instance
let postcodeGeneratorInstance: PostcodeGenerator | null = null;

function getPostcodeGenerator(): PostcodeGenerator {
  if (!postcodeGeneratorInstance) {
    postcodeGeneratorInstance = new PostcodeGenerator();
    postcodeGeneratorInstance.generatePostcodes();
  }
  return postcodeGeneratorInstance;
}

export const generateGhanaPostcodes = (): PostcodeData => {
  const generator = getPostcodeGenerator();
  return generator.generatePostcodes();
};

export const lookupGhanaPostcode = (postcode: string) => {
  const generator = getPostcodeGenerator();
  return generator.lookupPostcode(postcode);
};

export const validateGhanaPostcode = (postcode: string) => {
  const generator = getPostcodeGenerator();
  return generator.validatePostcode(postcode);
};




const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  
  // Utility function to chunk array into smaller pieces
  function chunkArray<T>(array: T[], size: number) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  async function clearExistingData() {
    console.log('Clearing existing data...');
    await prisma.postcodeLocality.deleteMany();
    await prisma.postcodeDistrict.deleteMany();
    await prisma.postcodeRegion.deleteMany();
    await prisma.postcodeMetadata.deleteMany();
  }
  
  async function saveRegionWithDistricts(region: PostcodeRegion, chunkSize = 50) {
    console.log(`Processing region: ${region.name}`);
    
    const savedRegion = await prisma.postcodeRegion.create({
      data: {
        code: region.code,
        name: region.name,
      },
    });
  
    let totalLocalitiesForRegion = 0;
  
    // Process districts in chunks
    const districtChunks = chunkArray(region.districts, 5);
    for (const districtChunk of districtChunks) {
      await prisma.$transaction(async (tx) => {
        for (const district of districtChunk) {
          console.log(`Processing district: ${district.name}`);
          
          const savedDistrict = await tx.postcodeDistrict.create({
            data: {
              code: district.code,
              name: district.name,
              postcode: `${region.code} ${district.code}00`,
              regionId: savedRegion.id,
            },
          });
  
          if (district.localities && district.localities.length > 0) {
            // Process localities in smaller chunks
            const localityChunks = chunkArray(district.localities, chunkSize);
            for (const localityChunk of localityChunks) {
              await tx.postcodeLocality.createMany({
                data: localityChunk.map(locality => ({
                  code: locality.code,
                  name: locality.name,
                  type: locality.type,
                  postcode: locality.postcode,
                  districtId: savedDistrict.id,
                })),
              });
            }
            totalLocalitiesForRegion += district.localities.length;
          }
        }
      }, {
        timeout: 10000 // 10 second timeout for each transaction
      });
    }
  
    return totalLocalitiesForRegion;
  }
  
  async function savePostcodesToDatabase() {
    try {
      console.log('Starting database update...');
      const postcodeData = generateGhanaPostcodes();
  
      // Clear existing data
      await clearExistingData();
  
      let totalLocalities = 0;
      let totalDistricts = 0;
  
      // Process each region
      for (const region of postcodeData.regions) {
        const regionLocalities = await saveRegionWithDistricts(region);
        totalLocalities += regionLocalities;
        totalDistricts += region.districts.length;
      }
  
      // Save metadata
      await prisma.postcodeMetadata.create({
        data: {
          lastGenerated: new Date(),
          totalRegions: postcodeData.regions.length,
          totalDistricts,
          totalLocalities,
          version: 1,
        },
      });
  
      console.log('\nPostcode Generation Statistics:');
      console.log(`Total Regions: ${postcodeData.regions.length}`);
      console.log(`Total Districts: ${totalDistricts}`);
      console.log(`Total Localities: ${totalLocalities}`);
  
      console.log('\nDatabase update completed successfully!');
    } catch (error) {
      console.error('Error saving to database:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
  
  async function main() {
    try {
      console.log('Starting postcode database population...');
      await savePostcodesToDatabase();
      console.log('Successfully completed database population!');
    } catch (error) {
      console.error('Error running script:', error);
      process.exit(1);
    }
  }
  
  main()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });














// // scripts/save-postcodes.ts

// // import { savePostcodesToDatabase } from '../lib/ghana-post/services/db-service';



// // import { generateGhanaPostcodes } from '@/lib/generate-post-codes';
// import { PrismaClient } from '@prisma/client';


// // import { GHANA_REGIONS_DATA } from '@/data';
// import localitiesData from '../lib/ghana-post/data/localities.json';


// interface District {
//     code: string;
//     name: string;
//     region: string;
//   }
  
//   interface Region {
//     code: string;
//     name: string;
//     districts: District[];
//   }

// // /lib/ghana-post/data.ts
// export const GHANA_REGIONS_DATA: Region[] = [
//     {
//         code: 'AH',
//         name: 'AHAFO',
//         districts: [
//             { code: 'HA', name: 'Asunafo North', region: 'AHAFO' },
//             { code: 'HB', name: 'Asunafo South', region: 'AHAFO' },
//             { code: 'HQ', name: 'Asutifi North', region: 'AHAFO' },
//             { code: 'HR', name: 'Asutifi South', region: 'AHAFO' },
//             { code: 'HT', name: 'Tano North', region: 'AHAFO' },
//             { code: 'HS', name: 'Tano South', region: 'AHAFO' },
//         ]
//     },
//     {
//         code: 'A',
//         name: 'ASHANTI',
//         districts: [
//             { code: 'A5', name: 'Adansi Asokwa', region: 'ASHANTI' },
//             { code: 'A2', name: 'Adansi North', region: 'ASHANTI' },
//             { code: 'A3', name: 'Adansi South', region: 'ASHANTI' },
//             { code: 'AF', name: 'Afigya Kwabre', region: 'ASHANTI' },
//             { code: 'AAK', name: 'Afigya Kwabre North', region: 'ASHANTI' },
//             { code: 'AX', name: 'Ahafo Ano North', region: 'ASHANTI' },
//             { code: 'A8', name: 'Ahafo Ano South East', region: 'ASHANTI' },
//             { code: 'AY', name: 'Ahafo Ano South West', region: 'ASHANTI' },
//             { code: 'AAF', name: 'Akrofuom', region: 'ASHANTI' },
//             { code: 'AAC', name: 'Amansie Central', region: 'ASHANTI' },
//             { code: 'AAM', name: 'Amansie South', region: 'ASHANTI' },
//             { code: 'AAW', name: 'Amansie West', region: 'ASHANTI' },
//             { code: 'AC', name: 'Asante Akim Central', region: 'ASHANTI' },
//             { code: 'AN', name: 'Asante Akim North', region: 'ASHANTI' },
//             { code: 'AA', name: 'Asante Akim South', region: 'ASHANTI' },
//             { code: 'AS', name: 'Asokore Mampong', region: 'ASHANTI' },
//             { code: 'AAS', name: 'Asokwa', region: 'ASHANTI' },
//             { code: 'AG', name: 'Atwima Kwanwoma', region: 'ASHANTI' },
//             { code: 'AI', name: 'Atwima Mponua', region: 'ASHANTI' },
//             { code: 'AH', name: 'Atwima Nwabiagya', region: 'ASHANTI' },
//             { code: 'AAT', name: 'Atwima Nwabiagya North', region: 'ASHANTI' },
//             { code: 'AB', name: 'Bekwai', region: 'ASHANTI' },
//             { code: 'AT', name: 'Bosomtwe', region: 'ASHANTI' },
//             { code: 'AE', name: 'Ejisu', region: 'ASHANTI' },
//             { code: 'AJ', name: 'Ejura-Sekyedumase', region: 'ASHANTI' },
//             { code: 'AL', name: 'Juaben', region: 'ASHANTI' },
//             { code: 'AK', name: 'Kumasi', region: 'ASHANTI' },
//             { code: 'AD', name: 'Kwabre East', region: 'ASHANTI' },
//             { code: 'AKW', name: 'Kwadaso', region: 'ASHANTI' },
//             { code: 'AM', name: 'Mampong', region: 'ASHANTI' },
//             { code: 'AO', name: 'Obuasi', region: 'ASHANTI' },
//             { code: 'AOE', name: 'Obuasi East', region: 'ASHANTI' },
//             { code: 'A6', name: 'Offinso North', region: 'ASHANTI' },
//             { code: 'A7', name: 'Offinso South', region: 'ASHANTI' },
//             { code: 'AOK', name: 'Oforikrom', region: 'ASHANTI' },
//             { code: 'AOT', name: 'Old Tafo', region: 'ASHANTI' },
//             { code: 'AP', name: 'Sekyere Afram Plains', region: 'ASHANTI' },
//             { code: 'AQ', name: 'Sekyere Central', region: 'ASHANTI' },
//             { code: 'AR', name: 'Sekyere East', region: 'ASHANTI' },
//             { code: 'AU', name: 'Sekyere Kumawu', region: 'ASHANTI' },
//             { code: 'AZ', name: 'Sekyere South', region: 'ASHANTI' },
//             { code: 'ASU', name: 'Suame', region: 'ASHANTI' },
//         ]
//     },
//     {
//         code: 'BO',
//         name: 'BONO',
//         districts: [
//             { code: 'BA', name: 'Banda', region: 'BONO' },
//             { code: 'BB', name: 'Berekum East', region: 'BONO' },
//             { code: 'BC', name: 'Berekum West', region: 'BONO' },
//             { code: 'BD', name: 'Dormaa Central', region: 'BONO' },
//             { code: 'BE', name: 'Dormaa East', region: 'BONO' },
//             { code: 'BF', name: 'Dormaa West', region: 'BONO' },
//             { code: 'BJ', name: 'Jaman North', region: 'BONO' },
//             { code: 'BI', name: 'Jaman South', region: 'BONO' },
//             { code: 'BS', name: 'Sunyani', region: 'BONO' },
//             { code: 'BY', name: 'Sunyani West', region: 'BONO' },
//             { code: 'BZ', name: 'Tain', region: 'BONO' },
//             { code: 'BW', name: 'Wenchi', region: 'BONO' },
//         ]
//     },
//     {
//         code: 'BE',
//         name: 'BONO EAST',
//         districts: [
//             { code: 'TA', name: 'Atebubu-Amantin', region: 'BONO EAST' },
//             { code: 'TK', name: 'Kintampo North', region: 'BONO EAST' },
//             { code: 'TL', name: 'Kintampo South', region: 'BONO EAST' },
//             { code: 'TN', name: 'Nkoranza North', region: 'BONO EAST' },
//             { code: 'TO', name: 'Nkoranza South', region: 'BONO EAST' },
//             { code: 'TP', name: 'Pru East', region: 'BONO EAST' },
//             { code: 'TW', name: 'Pru West', region: 'BONO EAST' },
//             { code: 'TE', name: 'Sene East', region: 'BONO EAST' },
//             { code: 'TS', name: 'Sene West', region: 'BONO EAST' },
//             { code: 'TT', name: 'Techiman', region: 'BONO EAST' },
//             { code: 'TX', name: 'Techiman North', region: 'BONO EAST' },
//         ]
//     },
//     {
//         code: 'C',
//         name: 'CENTRAL',
//         districts: [
//             { code: 'CA', name: 'Abura Asebu Kwamankese', region: 'CENTRAL' },
//             { code: 'CP', name: 'Agona East', region: 'CENTRAL' },
//             { code: 'CO', name: 'Agona West', region: 'CENTRAL' },
//             { code: 'CJ', name: 'Ajumako Enyan Esiam', region: 'CENTRAL' },
//             { code: 'CB', name: 'Asikuma / Odoben / Brakwa', region: 'CENTRAL' },
//             { code: 'CN', name: 'Assin Central', region: 'CENTRAL' },
//             { code: 'CR', name: 'Assin North', region: 'CENTRAL' },
//             { code: 'CS', name: 'Assin South', region: 'CENTRAL' },
//             { code: 'CX', name: 'Awutu Senya East', region: 'CENTRAL' },
//             { code: 'CC', name: 'Cape Coast', region: 'CENTRAL' },
//             { code: 'CE', name: 'Effutu', region: 'CENTRAL' },
//             { code: 'CF', name: 'Ekumfi', region: 'CENTRAL' },
//             { code: 'CL', name: 'Gomoa Central', region: 'CENTRAL' },
//             { code: 'CG', name: 'Gomoa East', region: 'CENTRAL' },
//             { code: 'CI', name: 'Gomoa West', region: 'CENTRAL' },
//             { code: 'CH', name: 'Hemang Lower Denkyira', region: 'CENTRAL' },
//             { code: 'CK', name: 'Komenda Edina Eguafo', region: 'CENTRAL' },
//             { code: 'CM', name: 'Mfantsiman', region: 'CENTRAL' },
//             { code: 'CT', name: 'Twifo Ati-Morkwa', region: 'CENTRAL' },
//             { code: 'CU', name: 'Upper Denkyira East', region: 'CENTRAL' },
//             { code: 'CV', name: 'Upper Denkyira West', region: 'CENTRAL' },
//         ]
//     },
//     {
//         code: 'E',
//         name: 'EASTERN',
//         districts: [
//             { code: 'E4', name: 'Abuakwa North', region: 'EASTERN' },
//             { code: 'E5', name: 'Abuakwa South', region: 'EASTERN' },
//             { code: 'EC', name: 'Achiase', region: 'EASTERN' },
//             { code: 'E2', name: 'Akuapem North', region: 'EASTERN' },
//             { code: 'E3', name: 'Akuapem South', region: 'EASTERN' },
//             { code: 'EM', name: 'Akyemansa', region: 'EASTERN' },
//             { code: 'E8', name: 'Asene Manso Akroso', region: 'EASTERN' },
//             { code: 'EA', name: 'Asuogyaman', region: 'EASTERN' },
//             { code: 'E9', name: 'Atiwa East', region: 'EASTERN' },
//             { code: 'E0', name: 'Atiwa West', region: 'EASTERN' },
//             { code: 'EP', name: 'Ayensuano', region: 'EASTERN' },
//             { code: 'EX', name: 'Birim Central', region: 'EASTERN' },
//             { code: 'EX', name: 'Birim North', region: 'EASTERN' },
//             { code: 'EZ', name: 'Birim South', region: 'EASTERN' },
//             { code: 'ED', name: 'Denkyembour', region: 'EASTERN' },
//             { code: 'EF', name: 'Fanteakwa North', region: 'EASTERN' },
//             { code: 'EG', name: 'Fanteakwa South', region: 'EASTERN' },
//             { code: 'EK', name: 'Kwaebibirem', region: 'EASTERN' },
//             { code: 'EP', name: 'Kwahu Afram Plains North', region: 'EASTERN' },
//             { code: 'EQ', name: 'Kwahu Afram Plains South', region: 'EASTERN' },
//             { code: 'EH', name: 'Kwahu East', region: 'EASTERN' },
//             { code: 'EI', name: 'Kwahu South', region: 'EASTERN' },
//             { code: 'EJ', name: 'Kwahu West', region: 'EASTERN' },
//             { code: 'EL', name: 'Lower Manya Krobo', region: 'EASTERN' },
//             { code: 'E7', name: 'New Juaben North', region: 'EASTERN' },
//             { code: 'EN', name: 'New Juaben South', region: 'EASTERN' },
//             { code: 'EG', name: 'Nsawam Adoagyiri', region: 'EASTERN' },
//             { code: 'ER', name: 'Okere', region: 'EASTERN' },
//             { code: 'ES', name: 'Suhum', region: 'EASTERN' },
//             { code: 'EU', name: 'Upper Manya Krobo', region: 'EASTERN' },
//             { code: 'EV', name: 'Upper West Akim', region: 'EASTERN' },
//             { code: 'EW', name: 'West Akim', region: 'EASTERN' },
//             { code: 'EY', name: 'Yilo Krobo', region: 'EASTERN' },
//         ]
//     },
//     {
//         code: 'GA',
//         name: 'GREATER ACCRA',
//         districts: [
//             { code: 'G7', name: 'Ablekuma Central', region: 'GREATER ACCRA' },
//             { code: 'GF', name: 'Ablekuma North', region: 'GREATER ACCRA' },
//             { code: 'GU', name: 'Ablekuma West', region: 'GREATER ACCRA' },
//             { code: 'GA', name: 'Accra', region: 'GREATER ACCRA' },
//             { code: 'GY', name: 'Ada East', region: 'GREATER ACCRA' },
//             { code: 'GX', name: 'Ada West', region: 'GREATER ACCRA' },
//             { code: 'GD', name: 'Adentan', region: 'GREATER ACCRA' },
//             { code: 'GB', name: 'Ashaiman', region: 'GREATER ACCRA' },
//             { code: 'G2', name: 'Ayawaso Central', region: 'GREATER ACCRA' },
//             { code: 'GV', name: 'Ayawaso East', region: 'GREATER ACCRA' },
//             { code: 'G3', name: 'Ayawaso North', region: 'GREATER ACCRA' },
//             { code: 'G4', name: 'Ayawaso West', region: 'GREATER ACCRA' },
//             { code: 'GE', name: 'Ga East', region: 'GREATER ACCRA' },
//             { code: 'GG', name: 'Ga North', region: 'GREATER ACCRA' },
//             { code: 'GS', name: 'Ga South', region: 'GREATER ACCRA' },
//             { code: 'GW', name: 'Ga West', region: 'GREATER ACCRA' },
//             { code: 'GR', name: 'Korle Klottey', region: 'GREATER ACCRA' },
//             { code: 'GK', name: 'Kpone Katamanso', region: 'GREATER ACCRA' },
//             { code: 'G6', name: 'Krowor', region: 'GREATER ACCRA' },
//             { code: 'GL', name: 'La Dade Kotopon', region: 'GREATER ACCRA' },
//             { code: 'GM', name: 'La Nkwantanang Madina', region: 'GREATER ACCRA' },
//             { code: 'GZ', name: 'Ledzokuku', region: 'GREATER ACCRA' },
//             { code: 'GN', name: 'Ningo Prampram', region: 'GREATER ACCRA' },
//             { code: 'GI', name: 'Okaikwei North', region: 'GREATER ACCRA' },
//             { code: 'GO', name: 'Shai-Osudoku', region: 'GREATER ACCRA' },
//             { code: 'GT', name: 'Tema', region: 'GREATER ACCRA' },
//             { code: 'GQ', name: 'Tema West', region: 'GREATER ACCRA' },
//             { code: 'GJ', name: 'Weija Gbawe', region: 'GREATER ACCRA' },
//         ]
//     },
//     {
//         code: 'NE',
//         name: 'NORTH EAST',
//         districts: [
//             { code: 'MP', name: 'Bunkpurugu Nakpanduri', region: 'NORTH EAST' },
//             { code: 'MC', name: 'Chereponi', region: 'NORTH EAST' },
//             { code: 'ME', name: 'East Mamprusi', region: 'NORTH EAST' },
//             { code: 'MM', name: 'Mamprugu Moagduri', region: 'NORTH EAST' },
//             { code: 'MW', name: 'West Mamprusi', region: 'NORTH EAST' },
//             { code: 'MY', name: 'Yunyoo Nasuan', region: 'NORTH EAST' },
//         ]
//     },
//     {
//         code: 'N',
//         name: 'NORTHERN',
//         districts: [
//             { code: 'NG', name: 'Gusheigu', region: 'NORTHERN' },
//             { code: 'NR', name: 'Karaga', region: 'NORTHERN' },
//             { code: 'NA', name: 'Kpandai', region: 'NORTHERN' },
//             { code: 'NK', name: 'Kumbungu', region: 'NORTHERN' },
//             { code: 'NI', name: 'Mion', region: 'NORTHERN' },
//             { code: 'NU', name: 'Nanton', region: 'NORTHERN' },
//             { code: 'NN', name: 'Nanumba North', region: 'NORTHERN' },
//             { code: 'NO', name: 'Nanumba South', region: 'NORTHERN' },
//             { code: 'NX', name: 'Saboba', region: 'NORTHERN' },
//             { code: 'NS', name: 'Sagnerigu', region: 'NORTHERN' },
//             { code: 'NV', name: 'Savelugu', region: 'NORTHERN' },
//             { code: 'NT', name: 'Tamale', region: 'NORTHERN' },
//             { code: 'NF', name: 'Tatale Sangule', region: 'NORTHERN' },
//             { code: 'NL', name: 'Tolon', region: 'NORTHERN' },
//             { code: 'NY', name: 'Yendi', region: 'NORTHERN' },
//             { code: 'NZ', name: 'Zabzugu', region: 'NORTHERN' },
//         ]
//     },
//     {
//         code: 'O',
//         name: 'OTI',
//         districts: [
//             { code: 'OB', name: 'Biakoye', region: 'OTI' },
//             { code: 'OG', name: 'Guan', region: 'OTI' },
//             { code: 'OJ', name: 'Jasikan', region: 'OTI' },
//             { code: 'OK', name: 'Kadjebi', region: 'OTI' },
//             { code: 'OE', name: 'Krachi East', region: 'OTI' },
//             { code: 'OQ', name: 'Krachi Nchumuru', region: 'OTI' },
//             { code: 'OW', name: 'Krachi West', region: 'OTI' },
//             { code: 'ON', name: 'Nkwanta North', region: 'OTI' },
//             { code: 'OS', name: 'Nkwanta South', region: 'OTI' },
//         ]
//     },
//     {
//         code: 'S',
//         name: 'SAVANNAH',
//         districts: [
//             { code: 'SB', name: 'Bole', region: 'SAVANNAH' },
//             { code: 'SG', name: 'Central Gonja', region: 'SAVANNAH' },
//             { code: 'SE', name: 'East Gonja', region: 'SAVANNAH' },
//             { code: 'SJ', name: 'North East Gonja', region: 'SAVANNAH' },
//             { code: 'SN', name: 'North Gonja', region: 'SAVANNAH' },
//             { code: 'SS', name: 'Sawla Tuna Kalba', region: 'SAVANNAH' },
//             { code: 'SW', name: 'West Gonja', region: 'SAVANNAH' },
//         ]
//     },
//     {
//         code: 'UE',
//         name: 'UPPER EAST',
//         districts: [
//             { code: 'UA', name: 'Bawku', region: 'UPPER EAST' },
//             { code: 'UW', name: 'Bawku West', region: 'UPPER EAST' },
//             { code: 'UU', name: 'Binduri', region: 'UPPER EAST' },
//             { code: 'UB', name: 'Bolgatanga', region: 'UPPER EAST' },
//             { code: 'UE', name: 'Bolgatanga East', region: 'UPPER EAST' },
//             { code: 'UO', name: 'Bongo', region: 'UPPER EAST' },
//             { code: 'UR', name: 'Builsa North', region: 'UPPER EAST' },
//             { code: 'US', name: 'Builsa South', region: 'UPPER EAST' },
//             { code: 'UG', name: 'Garu', region: 'UPPER EAST' },
//             { code: 'UK', name: 'Kassena Nankana East', region: 'UPPER EAST' },
//             { code: 'UL', name: 'Kassena Nankana West', region: 'UPPER EAST' },
//             { code: 'UN', name: 'Nabdam', region: 'UPPER EAST' },
//             { code: 'UP', name: 'Pusiga', region: 'UPPER EAST' },
//             { code: 'UT', name: 'Talensi', region: 'UPPER EAST' },
//             { code: 'UM', name: 'Tempane', region: 'UPPER EAST' },
//         ]
//     },
//     {
//         code: 'UW',
//         name: 'UPPER WEST',
//         districts: [
//             { code: 'XD', name: 'Daffiama Bussie Issa', region: 'UPPER WEST' },
//             { code: 'XJ', name: 'Jirapa', region: 'UPPER WEST' },
//             { code: 'XK', name: 'Lambussie Karni', region: 'UPPER WEST' },
//             { code: 'XL', name: 'Lawra', region: 'UPPER WEST' },
//             { code: 'XO', name: 'Nadowli Kaleo', region: 'UPPER WEST' },
//             { code: 'XN', name: 'Nandom', region: 'UPPER WEST' },
//             { code: 'XS', name: 'Sissala East', region: 'UPPER WEST' },
//             { code: 'XT', name: 'Sissala West', region: 'UPPER WEST' },
//             { code: 'XW', name: 'Wa', region: 'UPPER WEST' },
//             { code: 'XX', name: 'Wa East', region: 'UPPER WEST' },
//             { code: 'XY', name: 'Wa West', region: 'UPPER WEST' },
//         ]
//     },
//     {
//         code: 'V',
//         name: 'VOLTA',
//         districts: [
//             { code: 'VA', name: 'Adaklu', region: 'VOLTA' },
//             { code: 'VF', name: 'Afadjato South', region: 'VOLTA' },
//             { code: 'VG', name: 'Agotime Ziope', region: 'VOLTA' },
//             { code: 'VW', name: 'Akatsi North', region: 'VOLTA' },
//             { code: 'VX', name: 'Akatsi South', region: 'VOLTA' },
//             { code: 'VN', name: 'Anloga', region: 'VOLTA' },
//             { code: 'VV', name: 'Central Tongu', region: 'VOLTA' },
//             { code: 'VH', name: 'Ho', region: 'VOLTA' },
//             { code: 'VI', name: 'Ho West', region: 'VOLTA' },
//             { code: 'VC', name: 'Hohoe', region: 'VOLTA' },
//             { code: 'VK', name: 'Keta', region: 'VOLTA' },
//             { code: 'VY', name: 'Ketu North', region: 'VOLTA' },
//             { code: 'VZ', name: 'Ketu South', region: 'VOLTA' },
//             { code: 'VP', name: 'Kpando', region: 'VOLTA' },
//             { code: 'VD', name: 'North Dayi', region: 'VOLTA' },
//             { code: 'VT', name: 'North Tongu', region: 'VOLTA' },
//             { code: 'VE', name: 'South Dayi', region: 'VOLTA' },
//             { code: 'VU', name: 'South Tongu', region: 'VOLTA' },
//         ]
//     },
//     {
//         code: 'W',
//         name: 'WESTERN',
//         districts: [
//             { code: 'WH', name: 'Ahanta West', region: 'WESTERN' },
//             { code: 'WK', name: 'Effia Kwesimintsim', region: 'WESTERN' },
//             { code: 'WE', name: 'Ellembele', region: 'WESTERN' },
//             { code: 'WJ', name: 'Jomoro', region: 'WESTERN' },
//             { code: 'WM', name: 'Mpohor', region: 'WESTERN' },
//             { code: 'WN', name: 'Nzema East', region: 'WESTERN' },
//             { code: 'WP', name: 'Prestea Huni Valley', region: 'WESTERN' },
//             { code: 'WS', name: 'Sekondi-Takoradi', region: 'WESTERN' },
//             { code: 'WR', name: 'Shama', region: 'WESTERN' },
//             { code: 'WT', name: 'Tarkwa Nsuaem', region: 'WESTERN' },
//             { code: 'WW', name: 'Wassa Amenfi Central', region: 'WESTERN' },
//             { code: 'WX', name: 'Wassa Amenfi East', region: 'WESTERN' },
//             { code: 'WY', name: 'Wassa Amenfi West', region: 'WESTERN' },
//             { code: 'WZ', name: 'Wassa East', region: 'WESTERN' },
//         ]
//     },
//     {
//         code: 'WN',
//         name: 'WESTERN NORTH',
//         districts: [
//             { code: 'YA', name: 'Aowin', region: 'WESTERN NORTH' },
//             { code: 'YE', name: 'Bia East', region: 'WESTERN NORTH' },
//             { code: 'YW', name: 'Bia West', region: 'WESTERN NORTH' },
//             { code: 'YB', name: 'Bibiani Anhwiaso Bekwai', region: 'WESTERN NORTH' },
//             { code: 'YD', name: 'Bodi', region: 'WESTERN NORTH' },
//             { code: 'YJ', name: 'Juaboso', region: 'WESTERN NORTH' },
//             { code: 'YK', name: 'Sefwi Akontombra', region: 'WESTERN NORTH' },
//             { code: 'YS', name: 'Sefwi Wiawso', region: 'WESTERN NORTH' },
//             { code: 'YU', name: 'Suaman', region: 'WESTERN NORTH' },
//         ]
//     }
// ];


// interface Locality {
//   name: string;
//   type: 'city' | 'town' | 'suburb' | 'village' | 'neighborhood';
//   districtCode: string;
//   regionCode: string;
// }

// interface LocalityCollection {
//   [districtCode: string]: {
//     district: string;
//     region: string;
//     localities: Locality[];
//   };
// }

// interface PostcodeLocality {
//   name: string;
//   type: string;
//   code: string;
//   postcode: string;
// }

// interface PostcodeDistrict {
//   name: string;
//   code: string;
//   postcode: string;
//   localities: PostcodeLocality[];
// }

// interface PostcodeRegion {
//   name: string;
//   code: string;
//   districts: PostcodeDistrict[];
// }

// interface PostcodeData {
//   regions: PostcodeRegion[];
// }

// class PostcodeGenerator {
//   private localities: LocalityCollection;
//   private postcodeData: PostcodeData = { regions: [] };

//   constructor() {
//     // Use the imported localities data
//     this.localities = localitiesData as LocalityCollection;
//   }

//   private padNumber(num: number, length: number): string {
//     return num.toString().padStart(length, '0');
//   }

//   private generateDistrictCode(regionCode: string, districtIndex: number): string {
//     return this.padNumber(districtIndex + 1, 2);
//   }

//   private generateLocalityCode(districtCode: string, localityIndex: number): string {
//     return this.padNumber(localityIndex + 1, 2);
//   }

//   private generatePostcode(regionCode: string, districtCode: string, localityCode: string): string {
//     return `${regionCode} ${districtCode}${localityCode}`;
//   }

//   public generatePostcodes(): PostcodeData {
//     this.postcodeData = { regions: [] };

//     // Process each region
//     GHANA_REGIONS_DATA.forEach(region => {
//       const postcodeRegion: PostcodeRegion = {
//         name: region.name,
//         code: region.code,
//         districts: []
//       };

//       // Process districts within the region
//       region.districts.forEach((district, districtIndex) => {
//         const districtData = this.localities[district.code];
        
//         const districtCode = this.generateDistrictCode(region.code, districtIndex);
//         const postcodeDistrict: PostcodeDistrict = {
//           name: district.name,
//           code: districtCode,
//           postcode: `${region.code} ${districtCode}00`,
//           localities: []
//         };

//         // If we have locality data, process it
//         if (districtData?.localities) {
//           districtData.localities.forEach((locality, localityIndex) => {
//             const localityCode = this.generateLocalityCode(districtCode, localityIndex);
//             const postcode = this.generatePostcode(region.code, districtCode, localityCode);

//             const postcodeLocality: PostcodeLocality = {
//               name: locality.name,
//               type: locality.type,
//               code: localityCode,
//               postcode
//             };

//             postcodeDistrict.localities.push(postcodeLocality);
//           });
//         }

//         postcodeRegion.districts.push(postcodeDistrict);
//       });

//       this.postcodeData.regions.push(postcodeRegion);
//     });

//     return this.postcodeData;
//   }

//   public lookupPostcode(postcode: string): {
//     region: string;
//     district: string;
//     locality?: string;
//     postcode: string;
//   } | null {
//     const [regionCode, localCode] = postcode.split(' ');
//     if (!regionCode || !localCode || localCode.length !== 4) {
//       return null;
//     }

//     const districtCode = localCode.substring(0, 2);
//     const localityCode = localCode.substring(2, 4);

//     const region = this.postcodeData.regions.find(r => r.code === regionCode);
//     if (!region) return null;

//     const district = region.districts.find(d => d.code === districtCode);
//     if (!district) return null;

//     // Handle district-level postcodes (ending in 00)
//     if (localityCode === '00') {
//       return {
//         region: region.name,
//         district: district.name,
//         postcode: district.postcode
//       };
//     }

//     const locality = district.localities.find(l => l.code === localityCode);
//     if (!locality) return null;

//     return {
//       region: region.name,
//       district: district.name,
//       locality: locality.name,
//       postcode: locality.postcode
//     };
//   }

//   public validatePostcode(postcode: string): boolean {
//     const postcodeRegex = /^[A-Z]{1,2}\s\d{4}$/;
//     if (!postcodeRegex.test(postcode)) {
//       return false;
//     }
//     return this.lookupPostcode(postcode) !== null;
//   }
// }

// // Create a singleton instance
// let postcodeGeneratorInstance: PostcodeGenerator | null = null;

// function getPostcodeGenerator(): PostcodeGenerator {
//   if (!postcodeGeneratorInstance) {
//     postcodeGeneratorInstance = new PostcodeGenerator();
//     postcodeGeneratorInstance.generatePostcodes();
//   }
//   return postcodeGeneratorInstance;
// }

// export const generateGhanaPostcodes = (): PostcodeData => {
//   const generator = getPostcodeGenerator();
//   return generator.generatePostcodes();
// };

// export const lookupGhanaPostcode = (postcode: string) => {
//   const generator = getPostcodeGenerator();
//   return generator.lookupPostcode(postcode);
// };

// export const validateGhanaPostcode = (postcode: string) => {
//   const generator = getPostcodeGenerator();
//   return generator.validatePostcode(postcode);
// };




// const prisma = new PrismaClient();

// export async function savePostcodesToDatabase() {
//   try {
//     console.log('Starting database update...');
//     const postcodeData = generateGhanaPostcodes();

//     // Use a transaction to ensure data consistency
//     await prisma.$transaction(async (tx) => {
//       // First, clear existing data
//       console.log('Clearing existing data...');
//       await tx.postcodeLocality.deleteMany();
//       await tx.postcodeDistrict.deleteMany();
//       await tx.postcodeRegion.deleteMany();
//       await tx.postcodeMetadata.deleteMany();

//       let totalLocalities = 0;

//       // Process each region
//       for (const region of postcodeData.regions) {
//         console.log(`Processing region: ${region.name}`);
        
//         // Create region
//         const savedRegion = await tx.postcodeRegion.create({
//           data: {
//             code: region.code,
//             name: region.name,
//           },
//         });

//         // Process districts
//         for (const district of region.districts) {
//           console.log(`Processing district: ${district.name}`);
          
//           // Create district
//           const savedDistrict = await tx.postcodeDistrict.create({
//             data: {
//               code: district.code,
//               name: district.name,
//               postcode: `${region.code} ${district.code}00`,
//               regionId: savedRegion.id,
//             },
//           });

//           // Process localities
//           if (district.localities && district.localities.length > 0) {
//             const localitiesData = district.localities.map((locality) => ({
//               code: locality.code,
//               name: locality.name,
//               type: locality.type,
//               postcode: locality.postcode,
//               districtId: savedDistrict.id,
//             }));

//             await tx.postcodeLocality.createMany({
//               data: localitiesData,
//             });

//             totalLocalities += district.localities.length;
//           }
//         }
//       }

//       // Save metadata
//       await tx.postcodeMetadata.create({
//         data: {
//           lastGenerated: new Date(),
//           totalRegions: postcodeData.regions.length,
//           totalDistricts: postcodeData.regions.reduce(
//             (sum, region) => sum + region.districts.length, 0
//           ),
//           totalLocalities,
//           version: 1,
//         },
//       });

//       console.log('\nPostcode Generation Statistics:');
//       console.log(`Total Regions: ${postcodeData.regions.length}`);
//       console.log(`Total Districts: ${postcodeData.regions.reduce(
//         (sum, region) => sum + region.districts.length, 0
//       )}`);
//       console.log(`Total Localities: ${totalLocalities}`);
//     });

//     console.log('\nDatabase update completed successfully!');
//   } catch (error) {
//     console.error('Error saving to database:', error);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// export async function getPostcodeFromDatabase(postcode: string) {
//   try {
//     // Try to find locality postcode first
//     const locality = await prisma.postcodeLocality.findFirst({
//       where: { postcode },
//       include: {
//         district: {
//           include: {
//             region: true,
//           },
//         },
//       },
//     });

//     if (locality) {
//       return {
//         postcode: locality.postcode,
//         region: locality.district.region.name,
//         district: locality.district.name,
//         locality: locality.name,
//         type: locality.type,
//       };
//     }

//     // If not found, try district postcode
//     const district = await prisma.postcodeDistrict.findFirst({
//       where: { postcode },
//       include: {
//         region: true,
//       },
//     });

//     if (district) {
//       return {
//         postcode: district.postcode,
//         region: district.region.name,
//         district: district.name,
//       };
//     }

//     return null;
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// async function main() {
//   try {
//     console.log('Starting postcode database population...');
//     await savePostcodesToDatabase();
//     console.log('Successfully completed database population!');
//   } catch (error) {
//     console.error('Error running script:', error);
//     process.exit(1);
//   }
// }

// main()
//   .then(() => {
//     console.log('Script completed successfully');
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error('Script failed:', error);
//     process.exit(1);
//   });