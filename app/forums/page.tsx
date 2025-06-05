'use client';
import React, { useEffect, useState } from 'react';
import { useForums } from '../hooks/useForums';
import useUser from '../hooks/useUser';
import {
  Clock,
  Filter,
  MessageSquare,
  Plus,
  Search,
  Send,
  User,
  Heart,
  Eye,
  TrendingUp,
  Star,
  Hash,
  Users,
  ChevronDown,
  X,
  Edit3,
  Bookmark,
  Flame,
  Zap,
  Award,
  BookOpen,
  Coffee,
} from 'lucide-react';
import { ForumType, ReplyType } from '../types/ForumTypes';



const ForumsPage = () => {
  const {
    posts,
    fetchPosts,
    createPost,
    editPost,
    deletePost,
    addReply,
    fetchReplies,
    editReply,
    deleteReply
  } = useForums();
  const { user, loadingUser } = useUser();

  // Estados para formulario y filtros
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // edición y eliminación
  const [editingPost, setEditingPost] = useState<ForumType | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState('General');
  const [editingReply, setEditingReply] = useState<ReplyType | null>(null);
  const [editingReplyText, setEditingReplyText] = useState('');
  const [showEditReplyForm, setShowEditReplyForm] = useState(false);

  // Estados para respuestas
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(false);

  // Estado para ordenar posts
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');

  const categories = ['Todos', 'Academias', 'Eventos', 'Organización', 'Participantes', 'Espectadores', 'General'];

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Formatea la fecha para mostrar tiempo transcurrido
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 3600000); // diferencia en horas
    if (diff < 1) return 'Hace menos de 1 hora';
    if (diff < 24) return `Hace ${diff} horas`;
    return `Hace ${Math.floor(diff / 24)} días`;
  };

  // Filtra y ordena posts según filtros y búsqueda
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortBy === 'popular') {
        return b.views - a.views;
      } else if (sortBy === 'trending') {
        return b.repliesCount - a.repliesCount;
      }
      return 0;
    });

  // Maneja la creación de un nuevo post usando el hook
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    await createPost(title, description, category);
    setShowCreateForm(false);
    setTitle('');
    setDescription('');
    setCategory('General');
  };

  // Maneja la apertura del modal de respuestas
  const handleOpenReplies = async (post) => {
    setSelectedPost(post);
    setLoadingReplies(true);
    try {
      const postReplies = await fetchReplies(post.id);
      setReplies(postReplies);
    } catch (error) {
      console.error('Error al cargar respuestas:', error);
    }
    setLoadingReplies(false);
  };

  // Maneja el envío de una nueva respuesta
  const handleAddReply = async () => {
    if (!newReply.trim() || !selectedPost) return;
    try {
      await addReply(selectedPost.id, newReply);
      setNewReply('');
      // Recargar respuestas
      const updatedReplies = await fetchReplies(selectedPost.id);
      setReplies(updatedReplies);
    } catch (error) {
      console.error('Error al enviar respuesta:', error);
    }
  };

  // Cierra el modal de respuestas
  const handleCloseReplies = () => {
    setSelectedPost(null);
    setReplies([]);
    setNewReply('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'React': return <Hash className="w-4 h-4" />;
      case 'Firebase': return <Flame className="w-4 h-4" />;
      case 'JavaScript': return <Zap className="w-4 h-4" />;
      case 'CSS': return <Star className="w-4 h-4" />;
      case 'General': return <BookOpen className="w-4 h-4" />;
      default: return <Hash className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'React': return 'bg-gradient-to-r from-blue-500 to-cyan-400';
      case 'Firebase': return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'JavaScript': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'CSS': return 'bg-gradient-to-r from-pink-500 to-purple-500';
      case 'General': return 'bg-gradient-to-r from-gray-500 to-slate-600';
      default: return 'bg-gradient-to-r from-orange-500 to-red-500';
    }
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500"></div>
          <div className="mt-4 text-center text-orange-600 font-semibold">Cargando foros...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-red-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-red-300/20 to-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-200/10 to-red-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header mejorado */}
        <header className="text-center mb-12 relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <Coffee className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-orange-600 via-red-500 to-red-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Foros de Concursia
          </h1>
          <p className="text-xl text-orange-600/80 font-medium max-w-2xl mx-auto leading-relaxed">
            Conecta, aprende y comparte conocimiento con la comunidad más vibrante de marinera
          </p>
          <div className="mt-6 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-200"></div>
          </div>
        </header>

        {/* Controles mejorados */}
        <section className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-orange-100/50">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Barra de búsqueda */}
              <div className="relative flex-grow max-w-md group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5 group-focus-within:text-red-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar discusiones increíbles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/80 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 placeholder-orange-400/60"
                />
              </div>

              {/* Filtros */}
              <div className="flex gap-3">
                <div className="relative group">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4 group-focus-within:text-red-500 transition-colors" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-white/80 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 appearance-none cursor-pointer hover:bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative group">
                  <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4 group-focus-within:text-red-500 transition-colors" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="pl-10 pr-8 py-3 bg-white/80 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 appearance-none cursor-pointer hover:bg-white"
                  >
                    <option value="recent">🔥 Más recientes</option>
                    <option value="popular">👁️ Más vistos</option>
                    <option value="trending">💬 Más respuestas</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                  Nueva Discusión
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Formulario para crear nuevo post */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl w-full border-2 border-orange-100 relative transform animate-in fade-in-0 zoom-in-95 duration-300"
            >
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Crear nueva discusión</h2>
              </div>

              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Título impactante..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full p-4 bg-orange-50/50 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 placeholder-orange-400/60"
                />

                <textarea
                  placeholder="Describe tu idea, pregunta o pensamiento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                  className="w-full p-4 bg-orange-50/50 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 placeholder-orange-400/60 resize-none"
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-4 bg-orange-50/50 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 appearance-none cursor-pointer"
                >
                  {categories.filter((c) => c !== 'Todos').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePost}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Publicar Ahora
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de respuestas */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-orange-100 relative">
              <button
                onClick={handleCloseReplies}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 z-10"
              >
                <X size={20} />
              </button>

              {/* Header del post */}
              <div className="p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 pr-8">{selectedPost.title}</h2>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium ${getCategoryColor(selectedPost.category)} shadow-lg`}>
                    {getCategoryIcon(selectedPost.category)}
                    <span>{selectedPost.category}</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{selectedPost.description}</p>
                <div className="flex items-center gap-4 text-sm text-orange-600/80">
                  <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{selectedPost.createdByName}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeAgo(selectedPost.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Respuestas */}
              <div className="flex-1 overflow-y-auto max-h-96 p-6">
                {loadingReplies ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-2 border-orange-200 rounded-full animate-spin border-t-orange-500"></div>
                    <span className="ml-3 text-orange-600">Cargando respuestas...</span>
                  </div>
                ) : replies.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-orange-300 mx-auto mb-3" />
                    <p className="text-orange-600/70 font-medium">Sé el primero en responder</p>
                    <p className="text-orange-500/50 text-sm mt-1">Inicia la conversación compartiendo tu opinión</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="relative bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-4 border border-orange-100/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-800">{reply.createdByName}</span>
                          <span className="text-sm text-orange-500/70">{formatTimeAgo(reply.createdAt)}</span>

                          {/* Botones Edit y Delete para el creador del reply */}
                          {user && user.uid === reply.createdByUid && (
                            <div className="ml-auto flex items-center gap-2">
                              {/* Editar reply */}
                              <button
                                onClick={() => {
                                  setEditingReply(reply);
                                  setEditingReplyText(reply.text);
                                  setShowEditReplyForm(true);
                                }}
                                className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Eliminar reply */}
                              <button
                                onClick={() => {
                                  if (confirm('¿Eliminar esta respuesta?')) {
                                    deleteReply(selectedPost.id, reply.id);
                                    // luego recarga replies:
                                    fetchReplies(selectedPost.id).then(setReplies);
                                  }
                                }}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-gray-700 leading-relaxed ml-11">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formulario para nueva respuesta */}
              {user && (
                <div className="p-6 border-t border-orange-100 bg-gradient-to-r from-orange-50/30 to-red-50/30">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        rows={3}
                        className="w-full p-3 bg-white/80 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 placeholder-orange-400/60 resize-none"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleAddReply}
                          disabled={!newReply.trim()}
                          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-2xl flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:transform-none disabled:shadow-none"
                        >
                          <Send size={16} />
                          Responder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal de edición de reply */}
              {showEditReplyForm && editingReply && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-lg border-2 border-orange-100 relative transform animate-in fade-in-0 zoom-in-95 duration-300">
                    <button
                      onClick={() => {
                        setShowEditReplyForm(false);
                        setEditingReply(null);
                      }}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                    >
                      <X size={20} />
                    </button>

                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Editar respuesta</h3>

                    <textarea
                      value={editingReplyText}
                      onChange={(e) => setEditingReplyText(e.target.value)}
                      rows={4}
                      className="w-full p-3 bg-white/80 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 placeholder-orange-400/60 resize-none"
                    />

                    <div className="flex justify-end gap-4 mt-4">
                      <button
                        onClick={() => {
                          setShowEditReplyForm(false);
                          setEditingReply(null);
                        }}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-600 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={async () => {
                          // Llamamos a editReply del hook
                          await editReply(selectedPost.id, editingReply.id, editingReplyText.trim());
                          // Recargamos las respuestas
                          const updated = await fetchReplies(selectedPost.id);
                          setReplies(updated);
                          setShowEditReplyForm(false);
                          setEditingReply(null);
                        }}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-2 rounded-2xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {showEditForm && editingPost && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-2xl w-full border-2 border-orange-100 relative transform animate-in fade-in-0 zoom-in-95 duration-300">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setEditingPost(null);
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Editar discusión</h2>
              </div>

              <div className="space-y-6">
                {/* Input Título precargado */}
                <input
                  type="text"
                  placeholder="Título impactante..."
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  required
                  className="w-full p-4 bg-orange-50/50 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 placeholder-orange-400/60"
                />

                {/* Textarea Descripción precargada */}
                <textarea
                  placeholder="Describe tu idea, pregunta o pensamiento..."
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  required
                  rows={5}
                  className="w-full p-4 bg-orange-50/50 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 placeholder-orange-400/60 resize-none"
                />

                {/* Select Categoría precargado */}
                <select
                  value={editingCategory}
                  onChange={(e) => setEditingCategory(e.target.value)}
                  className="w-full p-4 bg-orange-50/50 border-2 border-orange-200 rounded-2xl focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 text-gray-700 appearance-none cursor-pointer"
                >
                  {categories.filter((c) => c !== 'Todos').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingPost(null);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={async () => {
                    // Llamar a editPost pasando values actualizados
                    await editPost(
                      editingPost.id,
                      editingTitle.trim(),
                      editingDescription.trim(),
                      editingCategory
                    );
                    setShowEditForm(false);
                    setEditingPost(null);
                  }}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Lista de posts mejorada */}
        <section className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-orange-500" />
              </div>
              <p className="text-xl text-orange-600/70 font-medium">No se encontraron discusiones.</p>
              <p className="text-orange-500/60 mt-2">Intenta con otros términos de búsqueda o crea una nueva discusión.</p>
            </div>
          ) : (
            filteredPosts.map((post, index) => (
              <article
                key={post.id}
                className="group bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-orange-100/50 hover:shadow-2xl hover:bg-white/90 transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Elemento decorativo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-100/30 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>

                <header className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex-1 pr-4">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium ${getCategoryColor(post.category)} shadow-lg`}>
                    {getCategoryIcon(post.category)}
                    <span>{post.category}</span>
                  </div>
                </header>

                <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">
                  {post.description}
                </p>

                <footer className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-orange-600/80">
                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{post.createdByName}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {user && user.uid === post.createdByUid && (
                      <>
                        {/* Botón Edit */}
                        <button
                          onClick={() => {
                            // 1) Asignar el post completo
                            setEditingPost(post);
                            // 2) Prellenar los inputs con los valores actuales
                            setEditingTitle(post.title);
                            setEditingDescription(post.description);
                            setEditingCategory(post.category);
                            // 3) Mostrar modal de edición
                            setShowEditForm(true);
                          }}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors duration-200"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Botón Delete */}
                        <button
                          onClick={() => {
                            // Confirmar antes de borrar (puedes usar window.confirm o un modal)
                            if (confirm('¿Estás seguro de eliminar esta discusión?')) {
                              deletePost(post.id);
                            }
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleOpenReplies(post)}
                      className="flex items-center gap-1 text-orange-500 bg-orange-50 px-3 py-1 rounded-full hover:bg-orange-100 transition-colors duration-200 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">{post.repliesCount}</span>
                    </button>

                    <div className="flex items-center gap-1 text-red-500 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors duration-200">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">{post.views}</span>
                    </div>

                    <button className="p-2 text-orange-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 transform hover:scale-110">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </footer>
              </article>
            ))
          )}
        </section>

        {/* Footer decorativo */}
        <footer className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-orange-500/60">
            <Award className="w-5 h-5" />
            <span className="font-medium">Impulsado por la comunidad</span>
            <Award className="w-5 h-5" />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ForumsPage;