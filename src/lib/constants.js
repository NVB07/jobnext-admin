// Job categories mapping
export const jobCategoriesMap = {
    "Academic/Education": "Giáo Dục",
    "Accounting/Auditing": "Kế toán/Kiểm toán",
    "Administration/Office Support": "Hành Chính Văn Phòng",
    "Agriculture/Livestock/Fishery": "Nông/Lâm/Ngư Nghiệp",
    "Architecture/Construction": "Kiến Trúc/Xây Dựng",
    "Art, Media & Printing/Publishing": "Nghệ thuật, Truyền thông/In ấn/Xuất bản",
    "Banking & Financial Services": "Ngân Hàng & Dịch Vụ Tài Chính",
    "CEO & General Management": "CEO & Quản lý chung",
    "Customer Service": "Dịch vụ khách hàng",
    Design: "Thiết kế",
    "Engineering & Sciences": "Kỹ thuật & Khoa học",
    "Food and Beverage": "Thực phẩm và Đồ uống",
    "Government/NGO": "Chính phủ/Tổ chức phi chính phủ",
    "Healthcare/Medical Services": "Chăm sóc sức khỏe/Dịch vụ y tế",
    "Hospitality/Tourism": "Khách sạn/Du lịch",
    "Human Resources/Recruitment": "Nhân sự/Tuyển dụng",
    "Information Technology/Telecommunications": "Công nghệ thông tin/Viễn thông",
    Insurance: "Bảo hiểm",
    Legal: "Pháp lý",
    "Logistics/Import Export/Warehouse": "Hậu cần/Xuất nhập khẩu/Kho bãi",
    Manufacturing: "Sản xuất",
    "Marketing, Advertising/Communications": "Marketing, Quảng cáo/Truyền thông",
    Pharmacy: "Dược phẩm",
    "Real Estate": "Bất động sản",
    "Retail/Consumer Products": "Bán lẻ/Sản phẩm tiêu dùng",
    Sales: "Kinh Doanh",
    Technician: "Kỹ thuật viên",
    "Textiles, Garments/Footwear": "Dệt may, May mặc/Giày dép",
    Transportation: "Vận tải",
    Others: "Khác",
};

// Experience levels mapping
export const experienceLevelsMap = {
    "Intern/Student": "Thực tập sinh/Sinh viên",
    "Fresher/Entry level": "Mới tốt nghiệp",
    "Experienced \\(non-manager\\)": "Nhân viên",
    Manager: "Quản lý/Trưởng phòng",
    "Director and above": "Giám đốc trở lên",
};

// Job sources mapping
export const jobSourcesMap = {
    vietnamworks: "VietnamWorks",
    admin: "Admin",
};

// Convert Vietnamese text to non-accented for search
export const convertToNonAccentedVietnamese = (str) => {
    if (!str) return "";
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str;
};
