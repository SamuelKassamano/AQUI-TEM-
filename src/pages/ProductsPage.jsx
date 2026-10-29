import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Package,
  Star,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  X
} from 'lucide-react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import { CATEGORIES } from '../../data/products';
import { useLanguage } from '../context/LanguageContext';
import { useStore } from '../context/StoreContext';
import { getTranslatedProduct, getTranslatedCategory } from '../utils/productTranslations';
import { createSlug } from '../utils/slug';

export default function ProductsPage() {
  const { lang, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('cat') || 'Todos';
  const urlQuery = searchParams.get('q') || '';

  const {
    activeProducts,
    getEffectivePrice,
    getPreviousPrice,
    formatPriceKz
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [sortBy, setSortBy] = useState('recommended');
  const [stockOnly, setStockOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    document.title = 'Produtos & Catálogo Completo | AQUI TEM Angola';
  }, []);

  // Sincroniza com parâmetros de URL quando alterados
  useEffect(() => {
    if (searchParams.get('cat')) {
      setSelectedCategory(searchParams.get('cat'));
    }
    if (searchParams.get('q') !== null) {
      setSearchQuery(searchParams.get('q'));
    }
  }, [searchParams]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'Todos') {
      newParams.delete('cat');
    } else {
      newParams.set('cat', cat);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (!val.trim()) {
      newParams.delete('q');
    } else {
      newParams.set('q', val.trim());
    }
    setSearchParams(newParams);
  };

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return activeProducts
      .map(p => getTranslatedProduct(p, lang))
      .filter(p => {
        const canonicalSelected = getTranslatedCategory(selectedCategory, 'pt');
        const prodCat = (p.originalCategory || p.category || '').toLowerCase();
        const prodName = (p.name || '').toLowerCase();
        const prodDesc = (p.description || '').toLowerCase();

        let matchesCategory =
          selectedCategory === 'Todos' ||
          selectedCategory === 'All' ||
          p.category === canonicalSelected ||
          p.originalCategory === canonicalSelected ||
          getTranslatedCategory(p.category, lang) === selectedCategory;

        if (!matchesCategory) {
          if (canonicalSelected === 'Smartwatches') {
            matchesCategory = prodName.includes('watch') || prodName.includes('smartwatch') || prodCat.includes('watch');
          } else if (canonicalSelected === 'Energia') {
            matchesCategory = prodName.includes('powerbank') || prodName.includes('power bank') || prodName.includes('bateria') || prodName.includes('magpower') || prodCat.includes('energia');
          } else if (canonicalSelected === 'Celular') {
            matchesCategory = prodName.includes('celular') || prodName.includes('telemóvel') || prodName.includes('smartphone') || prodName.includes('cabo') || prodName.includes('carregador') || prodName.includes('magpower');
          } else if (canonicalSelected === 'Áudio & Som') {
            matchesCategory = prodCat.includes('áudio') || prodCat.includes('audio') || prodName.includes('headphone') || prodName.includes('fones') || prodName.includes('coluna') || prodName.includes('tws');
          } else if (canonicalSelected === 'Acessórios & Casa') {
            matchesCategory = prodCat.includes('casa') || prodName.includes('camera') || prodName.includes('câmera') || prodName.includes('plug') || prodName.includes('tomada') || prodName.includes('copo') || prodName.includes('garrafa');
          } else if (canonicalSelected === 'TV & Vídeo') {
            matchesCategory = prodCat.includes('vídeo') || prodCat.includes('video') || prodCat.includes('tv') || prodName.includes('projetor') || prodName.includes('projector') || prodName.includes('tv');
          } else if (canonicalSelected === 'Acessórios & Tech') {
            matchesCategory = prodCat.includes('tech') || prodCat.includes('acessórios') || prodName.includes('carregador') || prodName.includes('gan') || prodName.includes('impressora') || prodName.includes('rastreador') || prodName.includes('gps');
          }
        }

        const matchesSearch =
          !q ||
          prodName.includes(q) ||
          prodDesc.includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.originalCategory || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q);

        const matchesStock = !stockOnly || Number(p.stock) > 0;

        return matchesCategory && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        const priceA = getEffectivePrice(a);
        const priceB = getEffectivePrice(b);
        if (sortBy === 'price-low') return priceA - priceB;
        if (sortBy === 'price-high') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [activeProducts, selectedCategory, searchQuery, sortBy, stockOnly, lang, getEffectivePrice]);

  return (
    <Layout>
      {/* Page Hero Header */}
      <div className="page-hero">
        <div className="page-hero-container">
          <div className="page-breadcrumbs">
            <Link to="/">Início</Link>
            <span>/</span>
            <span className="active">Produtos</span>
            {selectedCategory !== 'Todos' && (
              <>
                <span>/</span>
                <span className="active">{selectedCategory}</span>
              </>
            )}
          </div>
          <h1 className="page-hero-title">
            Catálogo de <span>Produtos</span>
          </h1>
          <p className="page-hero-sub">
            Explore a seleção completa de eletrônicos, tecnologia Oraimo original, utilidades inteligentes e eletrodomésticos com garantia oficial e entrega em Angola.
          </p>
        </div>
      </div>

      <div className="page-content-wrapper">
        {/* Filters and Controls */}
        <div
          style={{
            background: 'var(--bg-card)',
            padding: '18px 24px',
            borderRadius: '16px',
            border: '1px solid var(--border-light)',
            marginBottom: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Search bar inside catalog */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: 13, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Pesquisar por nome do produto, modelo, marca ou palavra-chave..."
                className="form-input"
                style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  style={{ position: 'absolute', right: 12, top: 12, background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={15} color="var(--text-muted)" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="form-input"
                  style={{ width: 'auto', padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <option value="recommended">{t('recommended') || 'Recomendados'}</option>
                  <option value="price-low">{t('priceLow') || 'Menor Preço'}</option>
                  <option value="price-high">{t('priceHigh') || 'Maior Preço'}</option>
                  <option value="rating">{t('bestRating') || 'Melhor Avaliados'}</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={stockOnly}
                  onChange={e => setStockOnly(e.target.checked)}
                />
                <span>Apenas em Estoque</span>
              </label>
            </div>
          </div>

          {/* Categories Filter Chips */}
          <div className="categories-chips" style={{ padding: '4px 0 0' }}>
            <button
              type="button"
              className={`category-chip ${selectedCategory === 'Todos' || selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => handleCategorySelect('Todos')}
            >
              Todos ({activeProducts.length})
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                type="button"
                className={`category-chip ${selectedCategory === c ? 'active' : ''}`}
                onClick={() => handleCategorySelect(c)}
              >
                {getTranslatedCategory(c, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
            Mostrando <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'produto' : 'produtos'}
            {selectedCategory !== 'Todos' && <span> na categoria <strong>{selectedCategory}</strong></span>}
            {searchQuery && <span> para "<strong>{searchQuery}</strong>"</span>}
          </div>

          {(selectedCategory !== 'Todos' || searchQuery || stockOnly) && (
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchQuery('');
                setStockOnly(false);
                setSearchParams({});
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary-orange)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RotateCcw size={13} /> Limpar Filtros
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-card)',
              borderRadius: '20px',
              border: '1px solid var(--border-light)'
            }}
          >
            <Search size={48} color="var(--text-light)" style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px' }}>Nenhum produto encontrado</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 16px', fontSize: '0.9rem' }}>
              Não encontramos resultados para a sua busca. Tente buscar por outros termos ou explore outras categorias.
            </p>
            <button
              className="nav-btn nav-btn-orange"
              onClick={() => {
                setSelectedCategory('Todos');
                setSearchQuery('');
                setStockOnly(false);
                setSearchParams({});
              }}
            >
              Ver Todos os Produtos
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        )}

        {/* Bottom Assurance Banner */}
        <div
          style={{
            marginTop: '48px',
            background: 'var(--bg-card)',
            padding: '24px 30px',
            borderRadius: '16px',
            border: '1px solid var(--border-light)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '10px', background: 'rgba(255, 101, 0, 0.1)', borderRadius: '10px', color: 'var(--primary-orange)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.92rem' }}>100% Selado na Caixa</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Garantia oficial e teste pré-despacho</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '10px', background: 'rgba(37, 211, 102, 0.1)', borderRadius: '10px', color: '#25D366' }}>
              <Truck size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.92rem' }}>Entrega em Toda Angola</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Luanda em 24h e províncias sob agendamento</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '10px', background: 'rgba(30, 92, 158, 0.1)', borderRadius: '10px', color: '#1E5C9E' }}>
              <Zap size={22} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '0.92rem' }}>Desconto Pronto Pagamento</strong>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>10% de desconto a pronto pagamento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <ProductQuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </Layout>
  );
}
