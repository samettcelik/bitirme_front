import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, Clock } from 'lucide-react';

const API_BASE_URL = 'http://localhost:3000/api';

const PracticesPage = () => {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    hasMore: false
  });
  const navigate = useNavigate();

  const fetchPractices = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const skip = (currentPage - 1) * itemsPerPage;
      const response = await fetch(`${API_BASE_URL}/practices?limit=${itemsPerPage}&skip=${skip}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPractices(data.practices || []);
      setPagination({
        total: data.total,
        hasMore: data.hasMore
      });
    } catch (error) {
      console.error('Pratikler getirilemedi:', error);
      setError('Pratikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPractices();
  }, [currentPage, itemsPerPage, navigate]);

  const totalPages = Math.ceil(pagination.total / itemsPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="ml-96 mr-8 my-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
          Pratiklerim
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Sayfa başına öğe:</span>
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {practices.length === 0 ? (
        <div className="text-gray-500 text-center p-4 bg-gray-50 rounded-lg">
          Henüz hiç pratik oluşturulmamış
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {practices.map((practice) => (
              <div
                key={practice._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 border-l-4 border-l-purple-700"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">{practice.pratikAdi}</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Oluşturulma: {formatDate(practice.createdAt)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Duygu Analizi</span>
                            <span className="text-xl font-bold">{practice.duyguAnaliz || 0}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Brain className="w-5 h-5 text-purple-600" />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Bilgi Analizi</span>
                            <span className="text-xl font-bold">{practice.bilgiAnaliz || 0}%</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Soru Sayısı:</span>
                          <span className="ml-2 font-bold">{practice.questions?.length || 0}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/pratikler/${practice._id}`)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-700 to-purple-900 text-white rounded-lg hover:from-purple-800 hover:to-purple-950 transition-all duration-300"
                      >
                        Detayları Gör
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 ${currentPage === page
                      ? 'bg-purple-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PracticesPage;