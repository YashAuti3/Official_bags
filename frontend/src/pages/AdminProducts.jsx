import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, Badge } from '../components/common/UI.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce, useOptimistic } from 'devil-frontend';
import { useApi } from 'devil-frontend';
import { useAppData } from '../context/DataContext';
import {
    AlertTriangle,
    Box,
    ImageIcon,
    IndianRupee,
    Loader2,
    Package,
    Plus,
    Search,
    Tag,
    Edit2,
    Trash2,
    X,
    Palette,
    ChevronDown
} from 'lucide-react';

export default function AdminProducts() {
    const {
        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        rawCategories,
        dataInitialized
    } = useAppData();
    const { get } = useApi();

    const categories = rawCategories || [];

    // Search
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const updateDebouncedSearch = useDebounce(val => setDebouncedSearch(val), 500);
    useEffect(() => {
        updateDebouncedSearch(searchTerm);
    }, [searchTerm, updateDebouncedSearch]);

    // Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    // isFirstResetMount ref hatao
    // Sirf yeh ek ref rakho
    const searchRef = useRef('');

    // SIRF EK EFFECT — reset + fetch dono
    useEffect(() => {
        if (!dataInitialized) return;
        if (page === 0) { setPage(1); return; }

        const searchChanged = searchRef.current !== debouncedSearch;
        searchRef.current = debouncedSearch;

        // Mount: products loaded hain, search nahi badla → skip
        if (page === 1 && products.length > 0 && !searchChanged) return;

        // Search change + page already 1 nahi → pehle reset karo
        if (searchChanged && page !== 1) {
            setProducts([]);
            setPage(1);
            setTotal(0);
            setHasMore(true);
            return;
        }

        // Search change + page 1 → products clear karke fetch
        if (searchChanged) {
            setProducts([]);
            setTotal(0);
            setHasMore(true);
        }

        let cancelled = false;

        const fetchPage = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (debouncedSearch) params.set('search', debouncedSearch);
                params.set('page', page.toString());
                params.set('limit', '10');

                const res = await get(`/products?${params.toString()}`);

                const newData =
                    res?.data && Array.isArray(res.data)
                        ? res.data
                        : Array.isArray(res)
                            ? res
                            : [];

                const totalCount =
                    res?.pagination?.total ??
                    res?.total ??
                    (Array.isArray(res) ? res.length : 0);

                if (cancelled) return;

                setTotal(totalCount);
                setHasMore(page * 10 < totalCount);
                setProducts(prev => page === 1 ? newData : [...prev, ...newData]);
            } catch (err) {
                console.error('Failed to load products', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchPage();
        return () => { cancelled = true; };
    }, [page, debouncedSearch, dataInitialized]);



    // Optimistic
    const {
        data: optimisticProducts,
        optimisticUpdate,
        setOptimisticData
    } = useOptimistic(products);

    useEffect(() => {
        setOptimisticData(products);
    }, [products, setOptimisticData]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        description: '',
        imageFiles: [],
        colors: []
    });
    const [newColor, setNewColor] = useState({ name: '', hex: '#000000' });

    const handleFormChange = e => {
        const { name, value, files } = e.target;
        if (name === 'imageFiles') {
            setFormData(prev => ({
                ...prev,
                imageFiles: [...prev.imageFiles, ...Array.from(files)]
            }));
            e.target.value = '';
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const removeImage = index =>
        setFormData(prev => ({
            ...prev,
            imageFiles: prev.imageFiles.filter((_, i) => i !== index)
        }));

    const addColor = () => {
        if (!newColor.name || !newColor.hex) return;
        setFormData(prev => ({ ...prev, colors: [...prev.colors, { ...newColor }] }));
        setNewColor({ name: '', hex: '#000000' });
    };

    const removeColor = index =>
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.filter((_, i) => i !== index)
        }));

    const openModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                title: product.title,
                category: product.category,
                price: product.price,
                description: product.description || '',
                imageFiles: [],
                colors: product.colors || []
            });
        } else {
            setEditingProduct(null);
            setFormData({
                title: '',
                category: categories[0] || '',
                price: '',
                description: '',
                imageFiles: [],
                colors: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('price', formData.price);
            data.append('description', formData.description);
            data.append('colors', JSON.stringify(formData.colors));
            formData.imageFiles.forEach(file => data.append('images', file));

            if (editingProduct) {
                await optimisticUpdate(
                    editingProduct._id,
                    {
                        title: formData.title,
                        category: formData.category,
                        price: formData.price,
                        description: formData.description
                    },
                    () => updateProduct(editingProduct._id, data)
                );
            } else {
                await addProduct(data);
                setProducts([]);
                setPage(1);
                setHasMore(true);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to save product:', err);
            alert(
                err?.response?.data?.message ||
                err?.message ||
                'Error saving product'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async id => {
        try {
            await optimisticUpdate(id, null, () => deleteProduct(id));
            setDeleteConfirmId(null);
        } catch (err) {
            console.error('Failed to delete product:', err);
        }
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">
                        Products Warehouse
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[4px] text-muted">
                        Manage your inventory & catalog
                    </p>
                </div>
                <Button
                    onClick={() => openModal()}
                    className="px-5 py-3 md:px-8 md:py-4 text-[10px] md:text-sm flex items-center gap-3 shadow-xl shadow-primary/20 shrink-0"
                >
                    <Plus size={18} /> Add New Product
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Products', val: total || products.length, icon: Box, color: 'primary' },
                    {
                        label: 'Active Categories',
                        val: new Set(optimisticProducts.map(p => p.category)).size,
                        icon: Tag,
                        color: 'dark'
                    },
                ].map((stat, i) => (
                    <Card
                        key={i}
                        className="flex items-center gap-5 p-6 border-none shadow-xl hover:-translate-y-1 transition-all"
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-${stat.color}/10 flex items-center justify-center text-${stat.color}`}>
                            <stat.icon size={28} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted">
                                {stat.label}
                            </span>
                            <span className="text-2xl font-black italic tracking-tighter text-dark">
                                {stat.val}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Search */}
            <Card className="flex items-center gap-4 py-4 px-8 border-none shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                <Search className="text-muted group-focus-within:text-primary transition-colors" size={24} />
                <input
                    type="text"
                    placeholder="Search products by title, category, or ID..."
                    className="flex-1 bg-transparent border-none outline-none font-bold text-lg uppercase tracking-tight placeholder:text-gray-300"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </Card>

            {/* Table */}
            <Card className="overflow-hidden p-0 border-none shadow-2xl rounded-3xl bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="hidden md:table-header-group bg-dark text-white uppercase text-[10px] font-black tracking-widest">
                            <tr>
                                <th className="px-5 py-4">Product Information</th>
                                <th className="px-4 py-4 text-center">Category</th>
                                <th className="px-4 py-4 text-center">Price</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="flex flex-col md:table-row-group gap-3 p-3 md:gap-0 md:p-0">
                            {optimisticProducts.map(p => (
                                <tr
                                    key={p._id || p.id}
                                    className="flex flex-col md:table-row bg-white rounded-3xl md:rounded-none shadow-lg shadow-primary/15 md:shadow-none border border-gray-100 md:border-b md:border-b-primary/10 overflow-hidden hover:bg-gray-50/50 transition-colors group"
                                >
                                    <td className="px-4 py-3 flex md:table-cell justify-between items-center gap-3 bg-gray-50 md:bg-transparent border-b border-gray-100 md:border-none">
                                        <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-500">Product</span>
                                        <div className="flex items-center gap-3 text-right flex-1 justify-end md:justify-start">
                                            <div className="flex flex-col gap-0.5 items-end md:items-start min-w-0">
                                                <span className="text-[9px] font-black text-primary tracking-widest">
                                                    #{p._id?.slice(-6) || p.id}
                                                </span>
                                                <span className="font-black text-sm md:text-base tracking-tight uppercase italic text-dark truncate max-w-[160px] md:max-w-none">
                                                    {p.title}
                                                </span>
                                            </div>
                                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden border border-gray-100 bg-white p-1 group-hover:border-primary transition-all shrink-0">
                                                <img src={p.image} alt="" className="w-full h-full object-contain" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 border-b border-gray-50 md:border-none md:text-center">
                                        <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">Category</span>
                                        <Badge variant="dark" className="whitespace-nowrap text-[9px]">{p.category}</Badge>
                                    </td>
                                    <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 border-b border-gray-50 md:border-none md:text-center">
                                        <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">Price</span>
                                        <span className="font-black text-lg text-dark tracking-tighter italic">₹{p.price}</span>
                                    </td>
                                    <td className="px-4 py-2.5 flex md:table-cell justify-between items-center gap-3 md:text-right">
                                        <span className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-400">Actions</span>
                                        {deleteConfirmId === (p._id || p.id) ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleDelete(p._id || p.id)}
                                                    variant="danger"
                                                    className="p-2 px-3 text-[8px] font-black tracking-widest whitespace-nowrap"
                                                >
                                                    CONFIRM
                                                </Button>
                                                <Button
                                                    onClick={() => setDeleteConfirmId(null)}
                                                    variant="outline"
                                                    className="p-2 px-3 text-[8px] font-black tracking-widest whitespace-nowrap"
                                                >
                                                    CANCEL
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openModal(p)}
                                                    className="p-2.5 bg-gray-100 rounded-xl text-muted hover:bg-primary hover:text-white transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(p._id || p.id)}
                                                    className="p-2.5 bg-gray-100 rounded-xl text-muted hover:bg-danger hover:text-white transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {hasMore && !loading && optimisticProducts.length > 0 && (
                    <div className="flex justify-center py-8 border-t border-gray-100">
                        <Button
                            onClick={() => setPage(prev => prev + 1)}
                            className="px-8 py-3 text-[10px] font-black uppercase tracking-widest"
                        >
                            Load More
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-12 bg-gray-50/50 border-t border-gray-100">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                )}
            </Card>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 bg-dark/80 backdrop-blur-md z-[100] flex justify-center items-start p-4 md:p-20 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="w-full max-w-4xl my-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Card className="flex flex-col gap-8 relative p-0 overflow-hidden shadow-2xl border-none bg-white rounded-[40px]">
                                <div className="bg-dark text-white p-10 flex justify-between items-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-full bg-primary/10 blur-[60px] translate-x-1/2" />
                                    <div className="flex flex-col gap-1 relative z-10">
                                        <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                                            {editingProduct ? 'Update Product' : 'Catalog Entry'}
                                        </h2>
                                        <p className="text-[10px] font-bold uppercase tracking-[4px] text-gray-500">
                                            Inventory Management System
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-4 bg-white/10 rounded-2xl text-white hover:bg-primary transition-all relative z-10"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-12 flex flex-col md:flex-row gap-12">
                                    {/* Left: Images */}
                                    <div className="md:w-1/3 flex flex-col gap-6">
                                        <div className="flex flex-col gap-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">
                                                Product Images
                                            </label>
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                {formData.imageFiles.map((file, idx) => (
                                                    <div key={idx} className="aspect-square rounded-2xl bg-gray-50 border border-gray-100 p-2 relative group overflow-hidden">
                                                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-contain" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(idx)}
                                                            className="absolute top-1 right-1 p-1.5 bg-danger text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {formData.imageFiles.length === 0 &&
                                                    editingProduct?.images?.map((img, idx) => (
                                                        <div key={idx} className="aspect-square rounded-2xl bg-gray-50 border border-gray-100 p-2 overflow-hidden opacity-50 grayscale hover:grayscale-0 transition-all">
                                                            <img src={img} alt="" className="w-full h-full object-contain" />
                                                        </div>
                                                    ))}
                                                <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 relative hover:border-primary hover:text-primary transition-all cursor-pointer">
                                                    <ImageIcon size={24} />
                                                    <span className="text-[8px] font-black uppercase tracking-tighter">Click to add</span>
                                                    <input
                                                        type="file"
                                                        name="imageFiles"
                                                        onChange={handleFormChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        accept="image/*"
                                                        multiple
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Fields */}
                                    <div className="flex-1 flex flex-col gap-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="col-span-2 flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2 px-1">
                                                    <Tag size={12} /> Product Title
                                                </label>
                                                <Input
                                                    name="title"
                                                    value={formData.title}
                                                    onChange={handleFormChange}
                                                    placeholder="E.g. Signature Leather Satchel"
                                                    required
                                                    className="py-4 text-sm font-bold bg-gray-50 border-none focus:bg-white transition-all shadow-sm"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2 relative">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2 px-1">
                                                    Category
                                                </label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                                                        className="w-full py-4 px-4 text-sm font-bold bg-gray-50 rounded-xl border-none focus:bg-white transition-all shadow-sm flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="dark" className="text-[10px] whitespace-nowrap px-3 py-1">
                                                                {formData.category || 'Select Category'}
                                                            </Badge>
                                                        </div>
                                                        <ChevronDown size={16} className={`text-muted transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {categoryDropdownOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                                className="absolute z-50 top-full mt-2 left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
                                                            >
                                                                {categories.map(cat => (
                                                                    <button
                                                                        key={cat}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFormData(prev => ({ ...prev, category: cat }));
                                                                            setCategoryDropdownOpen(false);
                                                                        }}
                                                                        className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-colors ${formData.category === cat ? 'text-primary' : 'text-dark'}`}
                                                                    >
                                                                        {cat}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2 px-1">
                                                    <IndianRupee size={12} /> Unit Price
                                                </label>
                                                <Input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleFormChange}
                                                    placeholder="4999"
                                                    required
                                                    className="py-4 text-sm font-black bg-gray-50 border-none focus:bg-white transition-all shadow-sm"
                                                />
                                            </div>

                                            {/* Colors */}
                                            <div className="col-span-2 flex flex-col gap-4 bg-gray-50/50 p-6 rounded-[24px] border border-gray-100">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                                    <Palette size={14} className="text-primary" /> Multi-Color Variation
                                                </label>
                                                <div className="flex flex-wrap gap-3">
                                                    {formData.colors.map((color, idx) => (
                                                        <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                                                            <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                                                            <span className="text-[10px] font-bold uppercase">{color.name}</span>
                                                            <button type="button" onClick={() => removeColor(idx)} className="text-gray-300 hover:text-danger transition-colors">
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Color Name"
                                                        value={newColor.name}
                                                        onChange={e => setNewColor({ ...newColor, name: e.target.value })}
                                                        className="flex-1 bg-white border-none outline-none py-3 px-4 rounded-xl text-[10px] font-bold shadow-sm"
                                                    />
                                                    <input
                                                        type="color"
                                                        value={newColor.hex}
                                                        onChange={e => setNewColor({ ...newColor, hex: e.target.value })}
                                                        className="w-12 h-10 p-1 bg-white rounded-xl border-none cursor-pointer shadow-sm"
                                                    />
                                                    <Button type="button" onClick={addColor} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-dark text-white rounded-xl">
                                                        Add
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="col-span-2 flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2 px-1">
                                                    Description
                                                </label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleFormChange}
                                                    rows={3}
                                                    placeholder="Handcrafted premium leather..."
                                                    className="w-full py-4 px-5 text-sm font-medium bg-gray-50 rounded-2xl border-none focus:bg-white transition-all shadow-sm resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 mt-auto">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1 py-5 border-gray-200 uppercase font-black tracking-widest text-xs"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Discard
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex-1 py-5 uppercase font-black tracking-widest text-xs shadow-xl shadow-primary/20"
                                            >
                                                {submitting ? 'PROCESSING...' : editingProduct ? 'Commit Changes' : 'Publish Product'}
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
