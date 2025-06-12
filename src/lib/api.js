const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Helper function to add auth header to requests
const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return token
        ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
          }
        : {
              "Content-Type": "application/json",
          };
};

// Admin User APIs
export const fetchUsers = async (page = 1, perPage = 20) => {
    try {
        const response = await fetch(`${API_URL}/admin/users?page=${page}&perPage=${perPage}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        return {
            users: data.data || [],
            pagination: data.pagination || {},
            success: data.success,
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { users: [], pagination: {}, success: false };
    }
};

export const fetchUserDetail = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to fetch user detail");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching user detail:", error);
        return { success: false, error: error.message };
    }
};

export const fetchUserStats = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/users/stats`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to fetch user stats");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return { success: false, stats: {} };
    }
};

export const searchUsers = async (searchParams = {}) => {
    try {
        const { search, page = 1, perPage = 20 } = searchParams;
        const queryParams = new URLSearchParams({
            page: page.toString(),
            perPage: perPage.toString(),
        });

        if (search) queryParams.append("search", search);

        const response = await fetch(`${API_URL}/admin/users/search?${queryParams}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to search users");
        const data = await response.json();
        return {
            users: data.data || [],
            pagination: data.pagination || {},
            searchQuery: data.searchQuery || {},
            success: data.success,
        };
    } catch (error) {
        console.error("Error searching users:", error);
        return { users: [], pagination: {}, searchQuery: {}, success: false };
    }
};

export const fetchJobs = async (page = 1, perPage = 10) => {
    try {
        const response = await fetch(`${API_URL}/jobs?page=${page}&perPage=${perPage}`);
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        return {
            jobs: data.data || [],
            pagination: data.pagination || {},
        };
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return { jobs: [], pagination: {} };
    }
};

export const fetchCvTemplates = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/cvTemplate`);
        if (!response.ok) throw new Error("Failed to fetch CV templates");
        const data = await response.json();
        return { templates: data.data || [] }; // Dữ liệu trả về trong data.data
    } catch (error) {
        console.error("Error fetching CV templates:", error);
        return { templates: [] };
    }
};

export const fetchStatistics = async () => {
    try {
        // Chỉ lấy một trang nhỏ data, cần thiết nhất là để lấy số lượng tổng từ pagination
        const jobsRes = await fetch(`${API_URL}/jobs?page=1&perPage=1`);
        const jobsData = await jobsRes.json();

        // Lấy dữ liệu user và CV templates - ADD AUTH HEADERS
        const [usersRes, cvRes] = await Promise.all([fetch(`${API_URL}/admin/users`, { headers: getAuthHeaders() }), fetch(`${API_URL}/admin/cvTemplate`)]);

        const [usersData, cvData] = await Promise.all([usersRes.json(), cvRes.json()]);

        return {
            totalUsers: usersData?.pagination?.totalUsers || 0,
            totalJobs: jobsData.pagination?.totalJobs || 0,
            totalTemplates: cvData.data?.length || 0,
        };
    } catch (error) {
        console.error("Error fetching statistics:", error);
        return {
            totalUsers: 0,
            totalJobs: 0,
            totalTemplates: 0,
        };
    }
};

export const fetchDashboardData = async () => {
    try {
        // Lấy thống kê số lượng từ API statistics
        const stats = await fetchStatistics();

        // Lấy sample data từ mỗi collection (giới hạn số lượng để cải thiện hiệu suất) - ADD AUTH HEADERS
        const [usersRes, jobsRes, cvRes] = await Promise.all([
            fetch(`${API_URL}/admin/users`, { headers: getAuthHeaders() }),
            fetch(`${API_URL}/jobs?page=1&perPage=10`), // Chỉ lấy 10 công việc
            fetch(`${API_URL}/admin/cvTemplate`, { headers: getAuthHeaders() }),
        ]);

        if (!usersRes.ok || !jobsRes.ok || !cvRes.ok) {
            throw new Error("Failed to fetch dashboard data");
        }

        const [usersData, jobsData, cvData] = await Promise.all([usersRes.json(), jobsRes.json(), cvRes.json()]);

        return {
            users: usersData || [], // Server trả về mảng users trực tiếp
            jobs: jobsData.data || [], // Dữ liệu job nằm trong data.data
            cvTemplates: cvData.data || [], // Dữ liệu cv template nằm trong data.data
            statistics: stats, // Thêm thông tin thống kê tổng hợp
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return {
            users: [],
            jobs: [],
            cvTemplates: [],
            statistics: {
                totalUsers: 0,
                totalJobs: 0,
                totalTemplates: 0,
            },
        };
    }
};

// Thêm các hàm API mới
export const fetchTopCompanies = async (limit = 5) => {
    try {
        const response = await fetch(`${API_URL}/jobs/stats/top-companies?limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch top companies");
        const data = await response.json();
        console.log(data);
        return data.data || [];
    } catch (error) {
        console.error("Error fetching top companies:", error);
        return [];
    }
};

export const fetchCompanies = async (page = 1, perPage = 10) => {
    try {
        const response = await fetch(`${API_URL}/jobs/stats/top-companies?page=${page}&perPage=${perPage}`);
        if (!response.ok) throw new Error("Failed to fetch companies");
        const data = await response.json();
        return {
            companies: data.data || [],
            pagination: data.pagination || {},
        };
    } catch (error) {
        console.error("Error fetching companies:", error);
        return { companies: [], pagination: {} };
    }
};

export const createUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error("Failed to create user");
        return await response.json();
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export const updateUser = async (uid, userData) => {
    try {
        const response = await fetch(`${API_URL}/users/${uid}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        if (!response.ok) throw new Error("Failed to update user");
        return await response.json();
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};

export const createJob = async (jobData) => {
    try {
        const response = await fetch(`${API_URL}/jobs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jobData),
        });
        if (!response.ok) throw new Error("Failed to create job");
        return await response.json();
    } catch (error) {
        console.error("Error creating job:", error);
        throw error;
    }
};

export const updateJob = async (id, jobData) => {
    try {
        const response = await fetch(`${API_URL}/jobs/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jobData),
        });
        if (!response.ok) throw new Error("Failed to update job");
        return await response.json();
    } catch (error) {
        console.error("Error updating job:", error);
        throw error;
    }
};

export const deleteJob = async (id) => {
    try {
        const response = await fetch(`${API_URL}/jobs/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete job");
        return await response.json();
    } catch (error) {
        console.error("Error deleting job:", error);
        throw error;
    }
};

export const searchJobs = async (page = 1, perPage = 10, filters = {}) => {
    try {
        const requestBody = {
            skill: filters.skill || "",
            category: filters.category || "",
            jobLevel: filters.jobLevel || "",
            jobSource: filters.jobSource || "",
        };

        const response = await fetch(`${API_URL}/jobs/search-no-match?page=${page}&perPage=${perPage}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error("Failed to search jobs");
        const data = await response.json();

        return {
            jobs: data.data || [],
            pagination: data.pagination || {},
        };
    } catch (error) {
        console.error("Error searching jobs:", error);
        return { jobs: [], pagination: {} };
    }
};

export const fetchJobCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/jobs/categories`);
        if (!response.ok) throw new Error("Failed to fetch job categories");
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Error fetching job categories:", error);
        return [];
    }
};

// Get a specific job by ID
export async function getJob(id) {
    try {
        const response = await fetch(`${API_URL}/jobs/${id}`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching job:", error);
        throw error;
    }
}

export const deleteUser = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to delete user");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: error.message };
    }
};

// Crawl management APIs
export const getCrawlStatus = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/crawl/status`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to get crawl status");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting crawl status:", error);
        return { success: false, error: error.message };
    }
};

export const startManualCrawl = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/crawl/start`, {
            method: "POST",
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to start crawl");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error starting crawl:", error);
        return { success: false, error: error.message };
    }
};

export const stopCrawl = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/crawl/stop`, {
            method: "POST",
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to stop crawl");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error stopping crawl:", error);
        return { success: false, error: error.message };
    }
};

export const getJobsToday = async (page = 1, perPage = 20) => {
    try {
        const response = await fetch(`${API_URL}/admin/crawl/jobs/today?page=${page}&perPage=${perPage}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to get today's jobs");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting today's jobs:", error);
        return { success: false, error: error.message };
    }
};

export const getExpiredJobs = async (page = 1, perPage = 20) => {
    try {
        const response = await fetch(`${API_URL}/admin/crawl/jobs/expired?page=${page}&perPage=${perPage}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to get expired jobs");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting expired jobs:", error);
        return { success: false, error: error.message };
    }
};

export const deleteExpiredJobs = async () => {
    try {
        const response = await fetch(`${API_URL}/admin/crawl/jobs/expired`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to delete expired jobs");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error deleting expired jobs:", error);
        return { success: false, error: error.message };
    }
};

// Admin Authentication APIs
export const adminLogin = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/admin/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Đăng nhập thất bại");
        }

        return data;
    } catch (error) {
        console.error("Error admin login:", error);
        return { success: false, error: error.message };
    }
};

export const adminLogout = async () => {
    try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch(`${API_URL}/admin/auth/logout`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        // Clear token regardless of response
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminEmail");

        return data;
    } catch (error) {
        console.error("Error admin logout:", error);
        // Clear token even on error
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminEmail");
        return { success: false, error: error.message };
    }
};

export const verifyAdminToken = async () => {
    try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
            return { success: false, error: "No token found" };
        }

        const response = await fetch(`${API_URL}/admin/auth/verify`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            // Clear invalid token
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminEmail");
            throw new Error(data.message || "Token verification failed");
        }

        return data;
    } catch (error) {
        console.error("Error verifying admin token:", error);
        return { success: false, error: error.message };
    }
};

// CV Management APIs for Canvas Components
export const GET_METHOD = async (urlPath, params = {}, headers = {}) => {
    try {
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
                ...headers,
            },
        };

        // Add query parameters if provided
        const queryParams = new URLSearchParams(params);
        const url = queryParams.toString() ? `${API_URL}/${urlPath}?${queryParams}` : `${API_URL}/${urlPath}`;

        const response = await fetch(url, config);
        if (!response.ok) throw new Error(`GET request failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
        return null;
    }
};

export const POST_METHOD = async (urlPath, data = null, headers = {}) => {
    try {
        const config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
                ...headers,
            },
            body: data ? JSON.stringify(data) : null,
        };

        const response = await fetch(`${API_URL}/${urlPath}`, config);
        if (!response.ok) throw new Error(`POST request failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi gửi dữ liệu:", error.message);
        return null;
    }
};

export const PATCH_METHOD = async (urlPath, data, headers = {}) => {
    try {
        const config = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
                ...headers,
            },
            body: JSON.stringify(data),
        };

        const response = await fetch(`${API_URL}/${urlPath}`, config);
        if (!response.ok) throw new Error(`PATCH request failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi cập nhật dữ liệu:", error.message);
        return null;
    }
};

export const DELETE_METHOD = async (urlPath, headers = {}) => {
    try {
        const config = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
                ...headers,
            },
        };

        const response = await fetch(`${API_URL}/${urlPath}`, config);
        if (!response.ok) throw new Error(`DELETE request failed: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Lỗi khi xóa dữ liệu:", error.message);
        return null;
    }
};

// CV Template Management APIs for Admin
export const createCvTemplate = async (templateData) => {
    try {
        const response = await fetch(`${API_URL}/admin/cvTemplate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(templateData),
        });
        if (!response.ok) throw new Error("Failed to create CV template");
        return await response.json();
    } catch (error) {
        console.error("Error creating CV template:", error);
        return { success: false, error: error.message };
    }
};

export const updateCvTemplate = async (templateId, templateData) => {
    try {
        const response = await fetch(`${API_URL}/admin/cvTemplate/${templateId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(templateData),
        });
        if (!response.ok) throw new Error("Failed to update CV template");
        return await response.json();
    } catch (error) {
        console.error("Error updating CV template:", error);
        return { success: false, error: error.message };
    }
};

export const deleteCvTemplate = async (templateId) => {
    try {
        const response = await fetch(`${API_URL}/admin/cvTemplate/${templateId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to delete CV template");
        return await response.json();
    } catch (error) {
        console.error("Error deleting CV template:", error);
        return { success: false, error: error.message };
    }
};
