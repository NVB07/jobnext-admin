const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const fetchUsers = async () => {
    try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        return { users: data }; // Server trả về mảng users trực tiếp
    } catch (error) {
        console.error("Error fetching users:", error);
        return { users: [] };
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
        const response = await fetch(`${API_URL}/cvTemplate`);
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

        // Lấy dữ liệu user và CV templates
        const [usersRes, cvRes] = await Promise.all([fetch(`${API_URL}/users`), fetch(`${API_URL}/cvTemplate`)]);

        const [usersData, cvData] = await Promise.all([usersRes.json(), cvRes.json()]);

        return {
            totalUsers: usersData?.length || 0,
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

        // Lấy sample data từ mỗi collection (giới hạn số lượng để cải thiện hiệu suất)
        const [usersRes, jobsRes, cvRes] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/jobs?page=1&perPage=10`), // Chỉ lấy 10 công việc
            fetch(`${API_URL}/cvTemplate`),
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
