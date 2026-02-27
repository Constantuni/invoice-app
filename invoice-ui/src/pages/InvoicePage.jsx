import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { getInvoices, saveInvoice, updateInvoice, deleteInvoice, getCustomers } from '../services/api';
import CustomerPage from './CustomerPage';

export default function InvoicePage() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const userId = parseInt(localStorage.getItem('userId'));

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [customers, setCustomers] = useState([]);
  const [showCustomers, setShowCustomers] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const firstDay = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(today);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm({
    mode: 'onChange',
    defaultValues: {
      invoiceNumber: '',
      invoiceDate: today,
      customerId: '',
      invoiceLines: [{ itemName: '', quentity: 1, price: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'invoiceLines' });

  const fetchInvoices = async () => {
    // Tarih kontrolü
    if (startDate > endDate) {
      setServerError('Başlangıç tarihi bitiş tarihinden sonra olamaz.');
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const res = await getInvoices(startDate, endDate);
      setInvoices(res.data);
    } catch {
      setServerError('Faturalar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchInvoices();
    fetchCustomers();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const openAddModal = () => {
    setEditingInvoice(null);
    setServerError('');
    reset({
      invoiceNumber: '',
      invoiceDate: today,
      customerId: '',
      invoiceLines: [{ itemName: '', quentity: 1, price: '' }],
    });
    setShowModal(true);
  };

  const openEditModal = (invoice) => {
    setEditingInvoice(invoice);
    setServerError('');
    reset({
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate?.split('T')[0],
      customerId: invoice.customerId || '',
      invoiceLines: invoice.invoiceLines?.length > 0
        ? invoice.invoiceLines.map(l => ({
            itemName: l.itemName,
            quentity: l.quentity,
            price: l.price,
          }))
        : [{ itemName: '', quentity: 1, price: '' }],
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const payload = {
        ...data,
        customerId: data.customerId ? parseInt(data.customerId) : null,
        userId,
        invoiceLines: data.invoiceLines.map(l => ({
          ...l,
          quentity: parseInt(l.quentity),
          price: parseFloat(l.price),
          userId,
        })),
      };

      if (editingInvoice) {
        await updateInvoice({ ...payload, invoiceId: editingInvoice.invoiceId });
        showSuccess('Fatura başarıyla güncellendi.');
      } else {
        await saveInvoice(payload);
        showSuccess('Fatura başarıyla eklendi.');
      }

      setShowModal(false);
      fetchInvoices();
    } catch {
      setServerError('İşlem sırasında bir hata oluştu.');
    }
  };

  const handleDelete = async (invoice) => {
    try {
      await deleteInvoice({ invoiceId: invoice.invoiceId });
      setDeleteConfirm(null);
      showSuccess('Fatura silindi.');
      fetchInvoices();
    } catch {
      setServerError('Silme işlemi başarısız.');
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar-custom">
        <span className="navbar-brand-custom">
          <span className="navbar-brand-icon">⚡️</span>
          InvoiceApp
        </span>
        <div className="d-flex align-items-center gap-3">
          <span className="navbar-user">👤 {userName}</span>
          <button className="btn-logout" onClick={() => setShowCustomers(true)}>👥 Müşteriler</button>
          <button className="btn-logout" onClick={handleLogout}>Çıkış Yap</button>
        </div>
      </nav>

      <div className="main-content">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h1 className="page-title">Faturalar</h1>
            <p className="page-subtitle">Tüm faturalarınızı buradan yönetebilirsiniz.</p>
          </div>
          <button className="btn-save" onClick={openAddModal}>+ Yeni Fatura</button>
        </div>

        {/* STATS */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#E8F0FE' }}>📋</div>
              <div>
                <div className="stat-value">{invoices.length}</div>
                <div className="stat-label">Toplam Fatura</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ECFDF5' }}>💰</div>
              <div>
                <div className="stat-value">₺{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                <div className="stat-label">Toplam Tutar</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#F5F3FF' }}>📅</div>
              <div>
                <div className="stat-value">{new Date().toLocaleDateString('tr-TR')}</div>
                <div className="stat-label">Bugün</div>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTS */}
        {successMsg && (
          <div className="alert alert-success alert-custom mb-4">✅ {successMsg}</div>
        )}
        {serverError && (
          <div className="alert alert-danger alert-custom mb-4">⚠️ {serverError}</div>
        )}

        {/* FILTER */}
        <div className="filter-card mb-4">
          <div className="row align-items-end g-3">
            <div className="col-md-4">
              <label className="form-label-custom">Başlangıç Tarihi</label>
              <input
                type="date"
                className="form-control form-control-custom"
                value={startDate}
                max={endDate} // Bitiş tarihinden sonrasını seçtirmez
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label-custom">Bitiş Tarihi</label>
              <input
                type="date"
                className="form-control form-control-custom"
                value={endDate}
                min={startDate} // Başlangıç tarihinden öncesini seçtirmez
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button className="btn-save w-100" onClick={fetchInvoices}>
                🔍 Filtrele
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card-custom">
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border" style={{ color: '#0066CC' }} />
              <p className="mt-3" style={{ color: '#6B7280', fontSize: '0.875rem' }}>Yükleniyor...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>Seçilen tarih aralığında fatura bulunamadı.</p>
            </div>
          ) : (
            <table className="table-custom w-100">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fatura No</th>
                  <th>Müşteri</th>
                  <th>Tarih</th>
                  <th>Tutar</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => (
                  <tr key={inv.invoiceId}>
                    <td style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{i + 1}</td>
                    <td>
                      <button
                        onClick={() => setDetailInvoice(inv)}
                        style={{ background: 'none', border: 'none', padding: 0, color: '#0066CC', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {inv.invoiceNumber}
                      </button>
                    </td>                    <td>{inv.customer?.title || <span style={{ color: '#9CA3AF' }}>—</span>}</td>
                    <td>{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('tr-TR') : '—'}</td>
                    <td><span className="badge-amount">₺{(inv.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span></td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn-edit" onClick={() => openEditModal(inv)}>Düzenle</button>
                        <button className="btn-delete" onClick={() => setDeleteConfirm(inv)}>Sil</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* INVOICE MODAL */}
      {showModal && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingInvoice ? 'Fatura Düzenle' : 'Yeni Fatura'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="modal-body">
                  {serverError && (
                    <div className="alert alert-danger alert-custom mb-3">⚠️ {serverError}</div>
                  )}

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label-custom">Fatura No *</label>
                      <input
                        className={`form-control form-control-custom ${errors.invoiceNumber ? 'is-invalid' : ''}`}
                        placeholder="ör: FTR-2024-001"
                        maxLength={50}
                        {...register('invoiceNumber', {
                          required: 'Fatura numarası zorunludur.',
                          maxLength: { value: 50, message: 'En fazla 50 karakter.' },
                          pattern: { value: /^[A-Za-z0-9\-_]+$/, message: 'Sadece harf, rakam, - ve _ kullanılabilir.' },
                        })}
                      />
                      {errors.invoiceNumber && <div className="invalid-feedback d-block">{errors.invoiceNumber.message}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label-custom">Fatura Tarihi *</label>
                      <input
                        type="date"
                        className={`form-control form-control-custom ${errors.invoiceDate ? 'is-invalid' : ''}`}
                        {...register('invoiceDate', { required: 'Tarih zorunludur.' })}
                      />
                      {errors.invoiceDate && <div className="invalid-feedback d-block">{errors.invoiceDate.message}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label-custom">Müşteri</label>
                      <select
                        className="form-control form-control-custom"
                        {...register('customerId')}
                      >
                        <option value="">— Müşteri seçin —</option>
                        {customers.map(c => (
                          <option key={c.customerId} value={c.customerId}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                    <p className="mb-0" style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>Fatura Kalemleri</p>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="invoice-line-row">
                      <div className="row g-2 align-items-start">
                        <div className="col-md-5">
                          <label className="form-label-custom">Ürün / Hizmet *</label>
                          <input
                            className={`form-control form-control-custom ${errors.invoiceLines?.[index]?.itemName ? 'is-invalid' : ''}`}
                            placeholder="Ürün adı"
                            maxLength={200}
                            {...register(`invoiceLines.${index}.itemName`, {
                              required: 'Ürün adı zorunludur.',
                              maxLength: { value: 200, message: 'En fazla 200 karakter.' },
                            })}
                          />
                          {errors.invoiceLines?.[index]?.itemName && (
                            <div className="invalid-feedback d-block">{errors.invoiceLines[index].itemName.message}</div>
                          )}
                        </div>
                        <div className="col-md-3">
                          <label className="form-label-custom">Miktar *</label>
                          <input
                            type="number"
                            className={`form-control form-control-custom ${errors.invoiceLines?.[index]?.quentity ? 'is-invalid' : ''}`}
                            onInput={e => { if (e.target.value.length > 8) e.target.value = e.target.value.slice(0, 8); }}
                            {...register(`invoiceLines.${index}.quentity`, {
                              required: 'Zorunlu.',
                              min: { value: 1, message: 'En az 1.' },
                              max: { value: 99999999, message: 'En fazla 99999999.' },
                            })}
                          />
                          {errors.invoiceLines?.[index]?.quentity && (
                            <div className="invalid-feedback d-block">{errors.invoiceLines[index].quentity.message}</div>
                          )}
                        </div>
                        <div className="col-md-3">
                          <label className="form-label-custom">Fiyat *</label>
                          <input
                            type="number"
                            step="0.01"
                            className={`form-control form-control-custom ${errors.invoiceLines?.[index]?.price ? 'is-invalid' : ''}`}
                            placeholder="0.00"
                            onInput={e => { if (e.target.value.length > 12) e.target.value = e.target.value.slice(0, 12); }}
                            {...register(`invoiceLines.${index}.price`, {
                              required: 'Zorunlu.',
                              min: { value: 0.01, message: 'Geçerli fiyat girin.' },
                              max: { value: 999999999.99, message: 'Çok büyük değer.' },
                            })}
                          />
                          {errors.invoiceLines?.[index]?.price && (
                            <div className="invalid-feedback d-block">{errors.invoiceLines[index].price.message}</div>
                          )}
                        </div>
                        <div className="col-md-1 d-flex align-items-start" style={{ paddingTop: '28px' }}>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              className="btn-delete w-100"
                              style={{ padding: '9px 8px' }}
                              onClick={() => remove(index)}
                            >✕</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-add-line"
                    onClick={() => append({ itemName: '', quentity: 1, price: '' })}
                  >
                    + Kalem Ekle
                  </button>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>İptal</button>
                  <button type="submit" className="btn-save" disabled={isSubmitting}>
                    {isSubmitting
                      ? <><span className="spinner-border spinner-border-sm me-2" />Kaydediliyor...</>
                      : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: '#DC2626' }}>Fatura Silinecek</h5>
                <button className="btn-close" onClick={() => setDeleteConfirm(null)} />
              </div>
              <div className="modal-body text-center py-4">
                <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.6 }}>🗑️</div>
                <p className="mb-1" style={{ fontWeight: 600 }}>{deleteConfirm.invoiceNumber}</p>
                <p className="text-muted" style={{ fontSize: '0.875rem' }}>Bu faturayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setDeleteConfirm(null)}>İptal</button>
                <button
                  className="btn-delete"
                  style={{ padding: '8px 20px', fontWeight: 600 }}
                  onClick={() => handleDelete(deleteConfirm)}
                >Evet, Sil</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailInvoice && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Fatura Detayı — {detailInvoice.invoiceNumber}</h5>
                <button className="btn-close" onClick={() => setDetailInvoice(null)} />
              </div>
              <div className="modal-body">

                {/* FATURA BİLGİLERİ */}
<div className="row g-3 mb-4">
  {/* Fatura No */}
  <div className="col-lg-4 col-sm-6 col-12">
    <p className="form-label-custom mb-1 text-muted small">Fatura No</p>
    <p className="mb-0" style={{ fontWeight: 600, color: '#111827', wordBreak: 'break-all' }}>
      {detailInvoice.invoiceNumber}
    </p>
  </div>

  {/* Fatura Tarihi */}
  <div className="col-lg-4 col-sm-6 col-12">
    <p className="form-label-custom mb-1 text-muted small">Fatura Tarihi</p>
    <p className="mb-0" style={{ fontWeight: 600, color: '#111827' }}>
      {detailInvoice.invoiceDate ? new Date(detailInvoice.invoiceDate).toLocaleDateString('tr-TR') : '—'}
    </p>
  </div>

  {/* Müşteri */}
  <div className="col-lg-4 col-sm-6 col-12">
    <p className="form-label-custom mb-1 text-muted small">Müşteri</p>
    <p className="mb-0" style={{ fontWeight: 600, color: '#111827' }}>
      {detailInvoice.customer?.title || '—'}
    </p>
  </div>

  {/* Vergi No */}
  {detailInvoice.customer?.taxNumber && (
    <div className="col-lg-4 col-sm-6 col-12">
      <p className="form-label-custom mb-1 text-muted small">Vergi No</p>
      <p className="mb-0" style={{ fontWeight: 600, color: '#111827' }}>
        {detailInvoice.customer.taxNumber}
      </p>
    </div>
  )}

  {/* E-posta */}
  {detailInvoice.customer?.email && (
    <div className="col-lg-4 col-sm-6 col-12">
      <p className="form-label-custom mb-1 text-muted small">E-posta</p>
      <p className="mb-0" style={{ fontWeight: 600, color: '#111827', wordBreak: 'break-word' }}>
        {detailInvoice.customer.email}
      </p>
    </div>
  )}

  {/* Adres */}
  {detailInvoice.customer?.address && (
    <div className="col-lg-4 col-sm-12 col-12">
      <p className="form-label-custom mb-1 text-muted small">Adres</p>
      <p className="mb-0" style={{ fontWeight: 600, color: '#111827', lineHeight: '1.4' }}>
        {detailInvoice.customer.address}
      </p>
    </div>
  )}
</div>

                {/* KALEMLER TABLOSU */}
                <p className="mb-2" style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>Fatura Kalemleri</p>
                <div className="card-custom p-0 mb-4" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table className="table-custom w-100" style={{ minWidth: '600px' }}> {/* minWidth tablonun çok sıkışmasını engeller */}
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ürün / Hizmet</th>
                        <th>Miktar</th>
                        <th>Birim Fiyat</th>
                        <th>Toplam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailInvoice.invoiceLines?.length > 0 ? (
                        detailInvoice.invoiceLines.map((line, i) => (
                          <tr key={line.invoiceLineId}>
                            <td style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{i + 1}</td>
                            <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{line.itemName}</td>
                            <td>{line.quentity}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>₺{(line.price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <span className="badge-amount">
                                ₺{((line.price || 0) * (line.quentity || 0)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px' }}>Kalem bulunamadı.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* TOPLAM */}
                <div className="d-flex justify-content-end">
                  <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '16px 24px', minWidth: '200px', border: '1px solid #E5E7EB' }}>
                    <div className="d-flex justify-content-between gap-4">
                      <span style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 500 }}>Genel Toplam</span>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#065F46' }}>
                        ₺{(detailInvoice.totalAmount || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setDetailInvoice(null)}>Kapat</button>
                <button className="btn-edit" style={{ padding: '8px 20px' }} onClick={() => { setDetailInvoice(null); openEditModal(detailInvoice); }}>Düzenle</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMER PAGE MODAL */}
      {showCustomers && (
        <CustomerPage onClose={() => { setShowCustomers(false); fetchCustomers(); fetchInvoices(); }} />
      )}
    </>
  );
}