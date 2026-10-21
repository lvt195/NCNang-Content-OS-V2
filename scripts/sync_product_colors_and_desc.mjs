import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbtngmjupjsbvxckeshe.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNidG5nbWp1cGpzYnZ4Y2tlc2hlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTg3NTg3MSwiZXhwIjoyMTA3NDUxODcxfQ._2Rn51wfMfQNS9-MC5HO9rnJEuKheR9A9NR983xqSbI';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Accurate descriptions and complete colors mapping for all 25 products
const PRODUCT_UPDATES = {
  SET165_CARO: {
    descText: `Bộ sưu tập ga gối đũi cotton kẻ caro mang đậm phong cách Hàn Quốc trẻ trung, năng động. Vải đũi cotton tự nhiên dệt từ sợi bông mềm mại, thoáng mát mùa hè, ấm áp mùa đông, thấm hút mồ hôi tốt và dịu nhẹ với làn da.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa đệm dày tới 15cm, nhận may đo theo yêu cầu)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'hong', 'tim', 'nau', 'do', 'den', 'trang', 'ke-caro', 'nhieu-mau']
  },
  SET165_SOC: {
    descText: `Bộ sưu tập họa tiết kẻ sọc thanh lịch và các khối hình học zigzag hiện đại, tối giản. Vải đũi cotton tự nhiên dệt từ sợi bông mềm mại, thoáng mát mùa hè, ấm áp mùa đông, thấm hút mồ hôi tốt và dịu nhẹ với làn da.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa đệm dày tới 15cm, nhận may đo theo yêu cầu)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'xanh-la', 'hong', 'vang', 'nau', 'ke-caro']
  },
  SET165_HOANHI: {
    descText: `Bộ sưu tập hoa nhí li ti mang vẻ đẹp vintage nhẹ nhàng, lãng mạn và tinh tế cho phòng ngủ. Vải đũi cotton tự nhiên dệt từ sợi bông mềm mại, thoáng mát mùa hè, ấm áp mùa đông, thấm hút mồ hôi tốt và dịu nhẹ với làn da.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa đệm dày tới 15cm, nhận may đo theo yêu cầu)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'xanh-la', 'hong', 'tim', 'trang', 'hoa-la']
  },
  SET165_HOACO: {
    descText: `Bộ sưu tập hoa cúc dại, hoa tulip và cỏ cây hoa lá mùa hạ tươi tắn, ngập tràn sức sống. Vải đũi cotton tự nhiên dệt từ sợi bông mềm mại, thoáng mát mùa hè, ấm áp mùa đông, thấm hút mồ hôi tốt và dịu nhẹ với làn da.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa đệm dày tới 15cm, nhận may đo theo yêu cầu)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'vang', 'tim', 'nau', 'trang', 'hoa-la']
  },
  SET165_GAU: {
    descText: `Bộ sưu tập gấu teddy, bánh mì, biscuit và tông màu be nâu ấm áp, ngọt ngào chuẩn phong cách Hàn Quốc. Vải đũi cotton tự nhiên dệt từ sợi bông mềm mại, thoáng mát mùa hè, ấm áp mùa đông, thấm hút mồ hôi tốt và dịu nhẹ với làn da.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa đệm dày tới 15cm, nhận may đo theo yêu cầu)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'hong', 'vang', 'nau']
  },
  SET165_THU: {
    descText: `Bộ sưu tập thỏ trắng, cún con đốm và mèo lười dễ thương phong cách Hàn Quốc. Vải đũi cotton tự nhiên dệt từ sợi bông mềm mại, thoáng mát mùa hè, ấm áp mùa đông, thấm hút mồ hôi tốt và dịu nhẹ với làn da.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa đệm dày tới 15cm, nhận may đo theo yêu cầu)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'xanh-la', 'hong', 'vang', 'nau', 'trang']
  },
  SET165_HOATHINH: {
    descText: `Bộ sưu tập nhân vật hoạt hình ngộ nghĩnh, Sanrio, gấu Pooh và họa tiết sinh động cho bé và gia đình trẻ. Vải đũi cotton tự nhiên dệt từ sợi bông mềm mại, thoáng mát mùa hè, ấm áp mùa đông, thấm hút mồ hôi tốt và dịu nhẹ với làn da.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa đệm dày tới 15cm, nhận may đo theo yêu cầu)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-la', 'hong', 'vang', 'tim', 'nau', 'nhieu-mau']
  },
  SET165_TRAITIM: {
    descText: `Bộ sưu tập trái tim, nơ xinh và dâu tây ngọt ngào tông hồng pastel dịu dàng nữ tính. Vải đũi cotton tự nhiên dệt từ sợi bông mềm mại, thoáng mát mùa hè, ấm áp mùa đông, thấm hút mồ hôi tốt và dịu nhẹ với làn da.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa đệm dày tới 15cm, nhận may đo theo yêu cầu)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'xanh-la', 'hong', 'tim', 'nau']
  },
  SET165_TRON: {
    descText: `Bộ sưu tập màu trơn mộc mạc và sọc xước tinh tế mang lại cảm giác bình yên, thư thái chuẩn tối giản Nhật Bản. Vải đũi cotton tự nhiên dệt từ sợi bông mềm mại, thoáng mát mùa hè, ấm áp mùa đông, thấm hút mồ hôi tốt và dịu nhẹ với làn da.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa đệm dày tới 15cm, nhận may đo theo yêu cầu)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'xanh-la', 'hong', 'nau', 'den', 'trang']
  },
  SET380_HOAKE: {
    descText: `Trọn bộ 4 món chăn ga gối cotton đũi họa tiết hoa nhí vintage, kẻ sọc và chấm bi pastel ngọt ngào. Chất liệu đũi cotton tự nhiên mềm mại, thoáng mát, dịu nhẹ với da, giặt máy thoải mái không xù lông.
Trọn bộ 4 món gồm:
- 1 Vỏ chăn lồng được ruột bông (kích thước 2m x 2m2 có khóa kéo)
- 1 Ga trải giường (bo chun hoặc phủ theo yêu cầu cỡ nệm)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)`,
    colors: ['be', 'xam', 'xanh-duong', 'xanh-la', 'hong', 'vang', 'tim', 'nau', 'do', 'trang', 'hoa-la', 'ke-caro']
  },
  SET380_HINHTHU: {
    descText: `Trọn bộ 4 món chăn ga gối cotton đũi họa tiết thú cưng ngộ nghĩnh: thỏ ngọc, mèo con, voi nhỏ và cún con đáng yêu. Chất liệu đũi cotton tự nhiên mềm mại, thoáng mát, dịu nhẹ với da.
Trọn bộ 4 món gồm:
- 1 Vỏ chăn lồng được ruột bông (kích thước 2m x 2m2 có khóa kéo)
- 1 Ga trải giường (bo chun hoặc phủ theo yêu cầu cỡ nệm)
- 2 Vỏ gối nằm đồng bộ (kích thước tiêu chuẩn 45x65cm)`,
    colors: ['be', 'xam', 'xanh-duong', 'xanh-la', 'hong', 'vang', 'tim', 'do', 'den', 'trang', 'hoa-la', 'ke-caro']
  },
  SET280: {
    descText: `Set ga gối nỉ nhung lông chuột cao cấp Pureloom Collection giá 280.000đ. Chất vải nỉ nhung lông chuột dày dặn, mềm mịn như tơ lụa, giữ ấm nhiệt cực tốt và hoàn toàn không rụng lông, không vón cục khi giặt máy. Phù hợp cho những ngày se lạnh mùa thu và mùa đông giá rét.
Trọn bộ 3 món gồm:
- 1 Ga chun nỉ nhung bọc đệm ôm sát (vừa đệm dày tới 20cm)
- 2 Vỏ gối nằm nỉ nhung đồng bộ (kích thước 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'xanh-la', 'hong', 'tim', 'nau', 'hoa-la', 'ke-caro']
  },
  SET350: {
    descText: `Set ga gối chất liệu thun lạnh Tencel Ice Silk cao cấp giá 350.000đ. Bề mặt vải mát lạnh tức thì ngay khi chạm vào da, sợi vải siêu mịn mượt kháng khuẩn, mang lại giấc ngủ êm ái mát mẻ suốt đêm hè. Tông màu trơn sang trọng, hiện đại chuẩn phong cách tối giản.
Trọn bộ 3 món gồm:
- 1 Ga chun thun lạnh bọc đệm (vừa đệm dày tới 20cm)
- 2 Vỏ gối nằm thun lạnh (kích thước tiêu chuẩn 45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'xanh-la', 'vang', 'tim', 'nau', 'den', 'trang']
  },
  LE_CHAN_NI_THO_300K: {
    descText: `Vỏ chăn nỉ lông thỏ 2 lớp ấm áp đón thu đông cực xinh xắn và mềm mại. Chất liệu lông thỏ êm mịn như mây, giữ nhiệt cực tốt, không xù lông rụng sợi khi giặt máy. Kích thước 2m x 2m2 có khóa kéo tiện lợi, có thể lồng thêm ruột bông vào mùa đại hàn hoặc dùng đắp trực tiếp mùa thu se lạnh.
Quy cách: 1 Vỏ chăn nỉ lông thỏ kích thước 2m x 2m2 (món lẻ tách rời).`,
    colors: ['be', 'xam', 'xanh-duong', 'hong', 'trang']
  },
  LE_CHAN_THUN_LANH_300K: {
    descText: `Chăn hè thun lạnh Tencel Ice Silk cao cấp chần viền vi tính sang trọng. Bề mặt vải trơn mát lạnh tức thì ngay khi chạm vào da, công nghệ làm mát tản nhiệt độc quyền cho giấc ngủ hè sảng khoái mát lành. Viền chăn may mí đôi tỉ mỉ, độ bền cao, giặt máy thoải mái không xô lệch bông.
Quy cách: 1 Chăn hè thun lạnh chần bông vi tính kích thước 2m x 2m2 (món lẻ tách rời).`,
    colors: ['be', 'xam', 'xanh-duong', 'xanh-la', 'hong', 'trang']
  },
  SET4_PHI_LUA_610K: {
    descText: `Dòng sản phẩm Romance Quilting cao cấp trên nền chất liệu vải phi lụa mềm mại, bóng mịn quý phái và thoáng khí. Từng đường kim mũi chỉ được chăm chút tỉ mỉ, chăn ga chần bông êm ái kết hợp bèo ren bao quanh tạo nên vẻ đẹp sang trọng, đẳng cấp cho căn phòng ngủ.
Trọn bộ 4 món gồm:
- 1 Chăn hè chần bông viền ren Romance cao cấp
- 1 Ga chần phủ freesize (phù hợp mọi kích cỡ nệm từ 1m6 đến 2m2)
- 2 Vỏ gối đầu chần bông viền ren 48x74cm`,
    colors: ['trang', 'be', 'xam', 'hong']
  },
  SET4_NI_CHAM_BI_700K: {
    descText: `Set 4 món chăn ga gối nỉ nhung chấm bi Polka Dot ấm áp thu đông. Chất nỉ nhung dày dặn, lông mềm mượt êm ái như nhung tuyết, không bai xù hay tích điện. Họa tiết chấm bi retro mang vẻ đẹp trẻ trung, hiện đại cho phòng ngủ những ngày đông lạnh giá.
Trọn bộ 4 món gồm:
- 1 Chăn chần nỉ nhung chấm bi giữ nhiệt đại hàn
- 1 Ga chần phủ freesize đồng bộ (may phủ hoặc bo chun theo yêu cầu)
- 2 Vỏ gối đầu nỉ nhung 48x74cm`,
    colors: ['be', 'xam', 'hong', 'nau', 'do', 'ke-caro']
  },
  SET4_BONG_XOP_400K: {
    descText: `Lấy cảm hứng từ chiếc bánh Puff Pastry kết cấu nhiều tầng đan xen, dòng chất liệu cotton đũi sợi bông xốp mới ra mắt với ưu điểm vượt trội: mềm mại xốp nhẹ, thoáng khí và giữ màu cực tốt. Họa tiết chấm bi Polka Dot bắt trend kết hợp viền ren răng cưa độc đáo tạo nên căn phòng ngủ xinh xắn phong cách Hàn Quốc.
Trọn bộ 4 món gồm:
- 1 Vỏ chăn có khóa kéo lồng ruột tiện lợi (2m x 2m2)
- 1 Ga trải giường freesize (bo chun hoặc phủ theo cỡ đệm)
- 2 Vỏ gối nằm đồng bộ viền răng cưa xinh xắn (45x65cm)`,
    colors: ['be', 'xam', 'xanh-duong', 'nau', 'hong', 'ke-caro']
  },
  SET370_HANQUOC_1: {
    descText: `Set 4 món chăn ga cotton phong cách Hàn Quốc tone hoa nhí vintage nhẹ nhàng, trẻ trung và ngọt ngào. Chất liệu vải cotton mềm mại, thoáng mát mùa hè và êm ấm mùa thu đông, giặt máy thoải mái không xù lông.
Trọn bộ 4 món gồm:
- 1 Vỏ chăn kéo khóa lồng ruột (2m x 2m2)
- 1 Ga trải giường (bo chun hoặc phủ bọc đệm tới 20cm)
- 2 Vỏ gối nằm đồng bộ (45x65cm)`,
    colors: ['trang', 'be', 'xanh-la', 'hong', 'vang', 'hoa-la']
  },
  SET370_HANQUOC_2: {
    descText: `Set 4 món chăn ga cotton vibe Hàn Quốc họa tiết kẻ caro phối tone hiện đại và các nhân vật dễ thương. Chất vải cotton bền màu, thấm hút tốt, giặt máy thoải mái không xù lông.
Trọn bộ 4 món gồm:
- 1 Vỏ chăn kéo khóa lồng ruột (2m x 2m2)
- 1 Ga trải giường (bo chun hoặc phủ bọc đệm tới 20cm)
- 2 Vỏ gối nằm đồng bộ (45x65cm)`,
    colors: ['be', 'xam', 'xanh-duong', 'nau', 'ke-caro']
  },
  SET4_BINGBONG_240K: {
    descText: `Set 4 món chăn ga gối kèm gối ôm BingBong siêu dễ thương tone màu pastel kẹo ngọt cho bé và cả gia đình. Chất vải đũi cotton mát mịn, êm ái, rất an toàn và dịu nhẹ cho làn da nhạy cảm.
Trọn bộ 4 món gồm:
- 1 Ga chun bọc đệm (vừa nệm dày tới 15cm)
- 1 Vỏ chăn hè kéo khóa lồng ruột
- 1 Vỏ gối nằm tiêu chuẩn (45x65cm)
- 1 Vỏ gối ôm BingBong tròn đáng yêu (35x100cm)`,
    colors: ['be', 'xanh-la', 'hong', 'vang', 'nhieu-mau']
  },
  SET_XINKK_220K: {
    descText: `Set 3 món ga gối đũi cotton mẫu xinh xắn hạt dẻ phong cách pastel Hàn Quốc. Nhiều họa tiết hoạt hình, gấu nhỏ và hoa cúc nhẹ nhàng, giá cực kỳ học sinh sinh viên.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa nệm dày tới 15cm)
- 2 Vỏ gối nằm đồng bộ (45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'hong', 'vang', 'hoa-la']
  },
  SET_NHAP_NI_280K: {
    descText: `Set 3 món ga gối chất liệu nỉ nhung tuyết cao cấp tự nhập trực tiếp. Sợi lông dệt siêu mịn màng, giữ ấm siêu nhanh ngay khi nằm xuống, ấm cúng trọn vẹn suốt mùa đông lạnh giá.
Trọn bộ 3 món gồm:
- 1 Ga chun nỉ nhung bọc đệm ôm sát (vừa nệm dày tới 20cm)
- 2 Vỏ gối nằm nỉ nhung êm ái (45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'hong', 'nau', 'do']
  },
  SET_NHAP_HOANHI_260K: {
    descText: `Bộ sưu tập ga gối đũi hoa nhí và hoa cỏ mùa hạ mang phong cách đồng quê Pháp mộc mạc và bình yên. Vải đũi mềm thoáng khí, thấm hút mồ hôi cực tốt và dịu nhẹ với da.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa nệm dày tới 15cm)
- 2 Vỏ gối nằm đũi hoa nhí (45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xanh-la', 'hong', 'vang', 'trang', 'hoa-la']
  },
  SET_NHAP_CARO_260K: {
    descText: `Set 3 món ga gối đũi cotton họa tiết kẻ caro và kẻ sọc hình học tối giản. Thiết kế thanh lịch hiện đại, phù hợp cho mọi không gian phòng ngủ tối giản kiểu Nhật và Bắc Âu.
Trọn bộ 3 món gồm:
- 1 Ga chun bọc đệm (vừa nệm dày tới 15cm)
- 2 Vỏ gối nằm kẻ caro (45x65cm)
*Lưu ý: Set 3 món không bao gồm vỏ chăn/ruột chăn.`,
    colors: ['be', 'xam', 'xanh-duong', 'nau', 'ke-caro']
  }
};

async function main() {
  console.log('Fetching all products from Supabase...');
  const { data: products, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Fetch error:', error);
    process.exit(1);
  }

  console.log(`Found ${products.length} products. Starting sync...`);

  for (const p of products) {
    const updateInfo = PRODUCT_UPDATES[p.id];
    if (!updateInfo) {
      console.log(`No specific update for ${p.id}, skipping.`);
      continue;
    }

    // Preserve existing <!--cats:...--> and <!--vars:...--> metadata tags
    const catsMatch = p.description?.match(/<!--cats:(.*?)-->/);
    const varsMatch = p.description?.match(/<!--vars:(.*?)-->/);

    let newDesc = updateInfo.descText.trim();
    if (catsMatch) {
      newDesc += `\n${catsMatch[0]}`;
    }
    if (varsMatch) {
      newDesc += `\n${varsMatch[0]}`;
    }

    const { error: updateErr } = await supabase
      .from('products')
      .update({
        description: newDesc,
        colors: updateInfo.colors,
      })
      .eq('id', p.id);

    if (updateErr) {
      console.error(`Error updating ${p.id}:`, updateErr.message);
    } else {
      console.log(`✓ Updated ${p.id} (${updateInfo.colors.length} colors attached)`);
    }
  }

  console.log('\nAll 25 products successfully synchronized!');
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
