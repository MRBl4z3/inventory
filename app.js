const App = () => {
    // --- STATE MANAGEMENT ---
    // State untuk mengelola halaman yang sedang aktif.
    const [currentPage, setCurrentPage] = React.useState('dashboard');
    // State untuk menyimpan semua data produk.
    const [products, setProducts] = React.useState([]);
    // State untuk status loading saat mengambil data.
    const [isLoading, setIsLoading] = React.useState(true);
    // State untuk produk yang sedang diedit. null jika sedang membuat produk baru.
    const [editingProduct, setEditingProduct] = React.useState(null);
    // State untuk mengelola modal konfirmasi (misal: untuk hapus data).
    const [modal, setModal] = React.useState({ isOpen: false, title: '', message: '', onConfirm: null });
     // State untuk sidebar di mobile
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);


    // --- MOCK API (Simulasi Backend) ---
    // Di aplikasi nyata, ini akan menjadi panggilan ke API backend Anda (Node.js/Express).
    const mockApi = {
        getProducts: async () => {
            console.log("API: Mengambil semua produk...");
            // Meniru latensi jaringan
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Jika belum ada data di localStorage, gunakan data awal.
            if (!localStorage.getItem('inventory_products')) {
                const initialData = [
                    { id: 'p1', name: 'Laptop Pro 14"', category: 'Elektronik', stock: 15, price: 25000000 },
                    { id: 'p2', name: 'Keyboard Mekanikal', category: 'Aksesoris', stock: 45, price: 1200000 },
                    { id: 'p3', name: 'Mouse Gaming RGB', category: 'Aksesoris', stock: 70, price: 850000 },
                    { id: 'p4', name: 'Monitor Ultrawide 34"', category: 'Elektronik', stock: 10, price: 7500000 },
                    { id: 'p5', name: 'Buku "React Clean Code"', category: 'Buku', stock: 120, price: 250000 },
                ];
                localStorage.setItem('inventory_products', JSON.stringify(initialData));
            }
            return JSON.parse(localStorage.getItem('inventory_products'));
        },
        saveProduct: async (productData) => {
            console.log("API: Menyimpan produk...", productData);
            await new Promise(resolve => setTimeout(resolve, 500));
            let currentProducts = JSON.parse(localStorage.getItem('inventory_products')) || [];
            if (productData.id) {
                // Update produk yang ada
                currentProducts = currentProducts.map(p => p.id === productData.id ? { ...p, ...productData } : p);
            } else {
                // Tambah produk baru
                const newProduct = { ...productData, id: `p${Date.now()}` };
                currentProducts.push(newProduct);
            }
            localStorage.setItem('inventory_products', JSON.stringify(currentProducts));
            return currentProducts;
        },
        deleteProduct: async (productId) => {
            console.log("API: Menghapus produk...", productId);
            await new Promise(resolve => setTimeout(resolve, 500));
            let currentProducts = JSON.parse(localStorage.getItem('inventory_products')) || [];
            const updatedProducts = currentProducts.filter(p => p.id !== productId);
            localStorage.setItem('inventory_products', JSON.stringify(updatedProducts));
            return updatedProducts;
        }
    };

    // --- DATA FETCHING & EFFECTS ---
    // useEffect untuk mengambil data produk saat komponen pertama kali dimuat.
    React.useEffect(() => {
        setIsLoading(true);
        mockApi.getProducts().then(data => {
            setProducts(data);
            setIsLoading(false);
        });
    }, []);

    // --- HANDLER FUNCTIONS ---
    // Fungsi untuk navigasi antar halaman.
    const handleNavigate = (page) => {
        setCurrentPage(page);
        setEditingProduct(null); // Reset editing state saat pindah halaman
        setIsSidebarOpen(false); // Tutup sidebar di mobile
    };

    // Fungsi untuk menangani penyimpanan produk (baik baru maupun update).
    const handleSaveProduct = async (productData) => {
        setIsLoading(true);
        const updatedProducts = await mockApi.saveProduct(productData);
        setProducts(updatedProducts);
        setIsLoading(false);
        handleNavigate('products');
    };

    // Fungsi untuk memulai proses edit produk.
    const handleEditProduct = (product) => {
        setEditingProduct(product);
        handleNavigate('form');
    };
    
    // Fungsi untuk menampilkan modal konfirmasi sebelum menghapus.
    const handleDeleteConfirmation = (productId) => {
        setModal({
            isOpen: true,
            title: 'Konfirmasi Hapus',
            message: 'Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.',
            onConfirm: () => handleDeleteProduct(productId)
        });
    };

    // Fungsi untuk menghapus produk setelah dikonfirmasi.
    const handleDeleteProduct = async (productId) => {
        setIsLoading(true);
        const updatedProducts = await mockApi.deleteProduct(productId);
        setProducts(updatedProducts);
        setIsLoading(false);
        setModal({ isOpen: false }); // Tutup modal
    };
    
    // Fungsi untuk menutup modal.
    const closeModal = () => {
        setModal({ isOpen: false });
    };

    // --- RENDER LOGIC ---
    // Komponen untuk me-render halaman yang sedang aktif.
    const renderPage = () => {
        if (isLoading && !modal.isOpen) {
            return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>;
        }
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard products={products} />;
            case 'products':
                return <ProductList products={products} onEdit={handleEditProduct} onDelete={handleDeleteConfirmation} />;
            case 'form':
                return <ProductForm onSave={handleSaveProduct} onCancel={() => handleNavigate('products')} initialData={editingProduct} />;
            default:
                return <Dashboard products={products} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
            <ConfirmationModal {...modal} onClose={closeModal} />
            <Sidebar onNavigate={handleNavigate} currentPage={currentPage} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6 md:p-8">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

// --- COMPONENTS ---

const Header = ({ onMenuClick }) => (
    <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center">
            <button onClick={onMenuClick} className="md:hidden mr-4 text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            <h1 className="text-xl font-bold text-white">Sistem Inventaris</h1>
        </div>
        <div className="flex items-center space-x-4">
            <span className="text-sm">Selamat datang, Admin!</span>
            <img className="w-8 h-8 rounded-full" src="https://placehold.co/40x40/6366f1/FFFFFF?text=A" alt="Admin" />
        </div>
    </header>
);

const Sidebar = ({ onNavigate, currentPage, isOpen, setIsOpen }) => {
    const NavLink = ({ page, label, icon }) => (
        <a href="#"
           onClick={(e) => { e.preventDefault(); onNavigate(page); }}
           className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
               currentPage === page
                   ? 'bg-indigo-600 text-white'
                   : 'text-gray-300 hover:bg-gray-700 hover:text-white'
           }`}>
            {icon}
            <span className="ml-3">{label}</span>
        </a>
    );

    const iconClass = "w-5 h-5";
    const icons = {
        dashboard: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>,
        products: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>,
        form: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
            <aside className={`absolute md:relative z-30 md:z-auto bg-gray-800 w-64 min-h-screen flex-shrink-0 p-4 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center mb-8">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    <span className="text-white text-2xl font-bold ml-2">Inventaris</span>
                </div>
                <nav className="space-y-2">
                    <NavLink page="dashboard" label="Dashboard" icon={icons.dashboard} />
                    <NavLink page="products" label="Daftar Produk" icon={icons.products} />
                    <NavLink page="form" label="Tambah Produk" icon={icons.form} />
                </nav>
            </aside>
        </>
    );
};

const Dashboard = ({ products }) => {
    // Menghitung statistik dari data produk
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStockProducts = products.filter(p => p.stock < 20).length;

    const StatsCard = ({ title, value, icon, color }) => (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
    
    const iconClass = "w-6 h-6 text-white";
    const icons = {
        box: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>,
        archive: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>,
        dollar: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01"></path></svg>,
        warning: <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Jenis Produk" value={totalProducts} icon={icons.box} color="bg-indigo-500"/>
                <StatsCard title="Total Stok" value={totalStock.toLocaleString('id-ID')} icon={icons.archive} color="bg-blue-500"/>
                <StatsCard title="Total Nilai Inventaris" value={`Rp ${totalValue.toLocaleString('id-ID')}`} icon={icons.dollar} color="bg-green-500"/>
                <StatsCard title="Stok Hampir Habis" value={lowStockProducts} icon={icons.warning} color="bg-red-500"/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="font-bold text-xl mb-4 text-white">Stok per Kategori</h3>
                    <CategoryChart products={products} />
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="font-bold text-xl mb-4 text-white">Produk Terbaru</h3>
                    <ul className="space-y-3">
                        {products.slice(-5).reverse().map(p => (
                            <li key={p.id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md">
                                <div>
                                    <p className="font-semibold text-white">{p.name}</p>
                                    <p className="text-sm text-gray-400">{p.category}</p>
                                </div>
                                <span className="font-bold text-indigo-400">{p.stock} Pcs</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const CategoryChart = ({ products }) => {
    const chartRef = React.useRef(null);
    const chartInstance = React.useRef(null);

    React.useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        const categoryData = products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + product.stock;
            return acc;
        }, {});

        chartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    label: 'Stok',
                    data: Object.values(categoryData),
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.7)',  // Indigo
                        'rgba(59, 130, 246, 0.7)',  // Blue
                        'rgba(16, 185, 129, 0.7)',  // Green
                        'rgba(239, 68, 68, 0.7)',   // Red
                        'rgba(245, 158, 11, 0.7)',  // Amber
                    ],
                    borderColor: '#4B5563',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#D1D5DB', // text-gray-300
                            font: {
                                family: "'Poppins', sans-serif"
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [products]);

    return <div className="h-80"><canvas ref={chartRef}></canvas></div>;
};

const ProductList = ({ products, onEdit, onDelete }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-white">Daftar Produk</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                    <tr>
                        <th scope="col" className="px-6 py-3">Nama Produk</th>
                        <th scope="col" className="px-6 py-3">Kategori</th>
                        <th scope="col" className="px-6 py-3">Stok</th>
                        <th scope="col" className="px-6 py-3">Harga</th>
                        <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                            <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{product.name}</th>
                            <td className="px-6 py-4">{product.category}</td>
                            <td className="px-6 py-4">{product.stock}</td>
                            <td className="px-6 py-4">Rp {product.price.toLocaleString('id-ID')}</td>
                            <td className="px-6 py-4 text-center space-x-2">
                                <button onClick={() => onEdit(product)} className="font-medium text-indigo-400 hover:underline">Ubah</button>
                                <button onClick={() => onDelete(product.id)} className="font-medium text-red-500 hover:underline">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const ProductForm = ({ onSave, onCancel, initialData }) => {
    const [product, setProduct] = React.useState({
        name: '',
        category: '',
        stock: '',
        price: ''
    });

    React.useEffect(() => {
        if (initialData) {
            setProduct(initialData);
        } else {
            setProduct({ name: '', category: '', stock: '', price: '' });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...product,
            stock: parseInt(product.stock, 10),
            price: parseInt(product.price, 10)
        });
    };

    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">{initialData ? 'Ubah Produk' : 'Tambah Produk Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">Nama Produk</label>
                    <input type="text" name="name" id="name" value={product.name} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required />
                </div>
                <div>
                    <label htmlFor="category" className="block mb-2 text-sm font-medium text-gray-300">Kategori</label>
                    <input type="text" name="category" id="category" value={product.category} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required />
                </div>
                <div>
                    <label htmlFor="stock" className="block mb-2 text-sm font-medium text-gray-300">Jumlah Stok</label>
                    <input type="number" name="stock" id="stock" value={product.stock} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required />
                </div>
                <div>
                    <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-300">Harga (Rp)</label>
                    <input type="number" name="price" id="price" value={product.price} onChange={handleChange} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5" required />
                </div>
                <div className="flex justify-end space-x-4">
                    <button type="button" onClick={onCancel} className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-500">Batal</button>
                    <button type="submit" className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Simpan Produk</button>
                </div>
            </form>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <p className="text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-700">Batal</button>
                    <button onClick={() => { onConfirm(); onClose(); }} className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-5 py-2.5">Ya, Lanjutkan</button>
                </div>
            </div>
        </div>
    );
};
