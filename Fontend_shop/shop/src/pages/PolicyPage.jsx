import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import './PolicyPage.css';

const policyContent = {
  'warranty': {
    title: 'Trung tâm bảo hành',
    content: (
      <>
        <h3>1. Thời hạn bảo hành</h3>
        <p>Tất cả sản phẩm công nghệ bán ra tại Gia dụng Xanh đều được bảo hành chính hãng từ 12 đến 24 tháng tùy loại sản phẩm. Thời gian bảo hành được tính từ ngày xuất hóa đơn mua hàng.</p>
        <h3>2. Điều kiện bảo hành</h3>
        <p>Sản phẩm sẽ được bảo hành miễn phí nếu đáp ứng các điều kiện sau:</p>
        <ul>
          <li>Sản phẩm còn trong thời hạn bảo hành.</li>
          <li>Tem bảo hành, mã vạch, số serial của sản phẩm phải còn nguyên vẹn.</li>
          <li>Sản phẩm bị lỗi kỹ thuật do nhà sản xuất.</li>
        </ul>
        <h3>3. Các trường hợp từ chối bảo hành</h3>
        <p>Sản phẩm bị hư hỏng do rơi vỡ, va đập, trầy xước, móp méo, ẩm ướt, hoen rỉ, chảy nước hoặc do hỏa hoạn, thiên tai, côn trùng xâm nhập.</p>
        <p>Sản phẩm có dấu hiệu đã bị tự ý tháo dỡ, sửa chữa thay thế linh kiện tại những nơi không thuộc hệ thống bảo hành chính hãng.</p>
      </>
    )
  },
  'faq': {
    title: 'Câu hỏi thường gặp',
    content: (
      <>
        <h3>Làm thế nào để đặt hàng online?</h3>
        <p>Bạn chỉ cần chọn sản phẩm, nhấn "Thêm vào giỏ hàng" và tiến hành các bước Thanh toán. Đội ngũ nhân viên sẽ gọi điện xác nhận đơn hàng của bạn trong vòng 30 phút.</p>
        <h3>Tôi có thể thanh toán bằng những hình thức nào?</h3>
        <p>Chúng tôi hỗ trợ nhiều hình thức thanh toán bao gồm: Tiền mặt khi nhận hàng (COD), Chuyển khoản ngân hàng, Quẹt thẻ, và Trả góp qua thẻ tín dụng 0%.</p>
        <h3>Bao lâu thì tôi nhận được hàng?</h3>
        <p>Thời gian giao hàng tiêu chuẩn là 2-4 ngày làm việc. Nếu bạn ở nội thành, chúng tôi có dịch vụ giao hàng siêu tốc trong 2 giờ.</p>
      </>
    )
  },
  'return': {
    title: 'Chính sách đổi trả',
    content: (
      <>
        <h3>1. Lỗi do nhà sản xuất</h3>
        <p>Hỗ trợ **1 đổi 1 trong vòng 30 ngày** đầu tiên sử dụng nếu sản phẩm phát sinh lỗi phần cứng từ nhà sản xuất. Mọi chi phí vận chuyển đổi trả sẽ do Gia dụng Xanh chi trả.</p>
        <h3>2. Đổi trả theo nhu cầu (Sản phẩm không lỗi)</h3>
        <p>Chúng tôi hỗ trợ thu lại sản phẩm với mức phí chiết khấu từ 10% - 20% giá trị hóa đơn trong 15 ngày đầu, tùy thuộc vào tình trạng hiện tại của sản phẩm và đầy đủ phụ kiện hộp.</p>
        <h3>3. Yêu cầu sản phẩm khi đổi trả</h3>
        <ul>
          <li>Sản phẩm không bị trầy xước, cấn móp, ngấm nước, hay có dấu hiệu tác động ngoại lực.</li>
          <li>Phải còn đầy đủ hộp, phụ kiện đi kèm, quà tặng khuyến mãi (nếu có).</li>
          <li>Tài khoản iCloud, Google, Mi Account... phải được đăng xuất hoàn toàn.</li>
        </ul>
      </>
    )
  },
  'shipping': {
    title: 'Giao hàng & Lắp đặt',
    content: (
      <>
        <h3>Chính sách Giao hàng</h3>
        <p>Miễn phí giao hàng cho tất cả các đơn hàng có giá trị từ 5.000.000 VNĐ trở lên. Đối với đơn hàng dưới mức này, phí vận chuyển sẽ được tính dựa trên khoảng cách và kích thước hàng hóa.</p>
        <h3>Chính sách Lắp đặt</h3>
        <p>Gia dụng Xanh cung cấp dịch vụ lắp đặt tận nhà hoàn toàn miễn phí đối với các thiết bị như Tivi, Loa soundbar, Máy lạnh, Tủ lạnh, Máy giặt. Kỹ thuật viên của chúng tôi được đào tạo bài bản và cam kết lắp đặt an toàn, đúng quy chuẩn.</p>
      </>
    )
  },
  'terms': {
    title: 'Điều khoản sử dụng',
    content: (
      <>
        <h3>1. Chấp thuận điều khoản</h3>
        <p>Khi truy cập và mua sắm tại trang web Gia dụng Xanh, bạn được xem là đã đồng ý với các điều khoản và điều kiện được nêu tại đây.</p>
        <h3>2. Thay đổi nội dung</h3>
        <p>Chúng tôi có quyền thay đổi, chỉnh sửa, thêm hoặc lược bỏ bất kỳ phần nào trong Quy định và Điều kiện sử dụng vào bất cứ lúc nào. Các thay đổi có hiệu lực ngay khi được đăng trên trang web mà không cần thông báo trước.</p>
        <h3>3. Quyền sở hữu trí tuệ</h3>
        <p>Mọi nội dung, hình ảnh, âm thanh, video trên trang web này đều thuộc quyền sở hữu của Gia dụng Xanh và được bảo vệ bởi luật sở hữu trí tuệ Việt Nam.</p>
      </>
    )
  },
  'privacy': {
    title: 'Chính sách bảo mật',
    content: (
      <>
        <h3>Thu thập thông tin cá nhân</h3>
        <p>Chúng tôi chỉ thu thập những thông tin cần thiết (Họ tên, Số điện thoại, Địa chỉ giao hàng, Email) nhằm phục vụ cho việc xử lý đơn hàng và liên hệ với quý khách.</p>
        <h3>Cam kết bảo mật</h3>
        <p>Gia dụng Xanh cam kết không bán, chia sẻ hay trao đổi thông tin cá nhân của khách hàng thu thập trên trang web cho một bên thứ ba nào khác. Thông tin chỉ được sử dụng nội bộ công ty cho việc cải thiện dịch vụ khách hàng.</p>
      </>
    )
  },
  'cookies': {
    title: 'Chính sách Cookies',
    content: (
      <>
        <p>Trang web này sử dụng cookies để nâng cao trải nghiệm mua sắm của bạn. Cookies giúp chúng tôi ghi nhớ giỏ hàng, thông tin đăng nhập và các sở thích cá nhân của bạn trên trình duyệt.</p>
        <p>Bạn hoàn toàn có thể từ chối cookies bằng cách thay đổi thiết lập trong trình duyệt, tuy nhiên điều này có thể làm giảm một số tính năng tiện ích của trang web.</p>
      </>
    )
  }
};

export function PolicyPage() {
  const { type } = useParams();
  const currentPolicy = policyContent[type] || {
    title: 'Trang không tồn tại',
    content: <p>Nội dung bạn đang tìm kiếm không có sẵn hoặc đã bị gỡ bỏ.</p>
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [type]);

  const sidebarLinks = [
    { id: 'warranty', label: 'Trung tâm bảo hành' },
    { id: 'faq', label: 'Câu hỏi thường gặp' },
    { id: 'return', label: 'Chính sách đổi trả' },
    { id: 'shipping', label: 'Giao hàng & Lắp đặt' },
    { id: 'terms', label: 'Điều khoản sử dụng' },
    { id: 'privacy', label: 'Chính sách bảo mật' },
    { id: 'cookies', label: 'Chính sách Cookies' },
  ];

  return (
    <div className="policy-container">
      <div className="policy-sidebar">
        <h3>Danh mục Hỗ trợ</h3>
        <ul>
          {sidebarLinks.map(link => (
            <li key={link.id}>
              <Link 
                to={`/policy/${link.id}`} 
                className={type === link.id ? 'active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="policy-content">
        <h1>{currentPolicy.title}</h1>
        <div className="policy-body">
          {currentPolicy.content}
        </div>
      </div>
    </div>
  );
}
