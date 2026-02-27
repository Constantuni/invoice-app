import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getCustomers, saveCustomer, updateCustomer, deleteCustomer } from '../services/api';

export default function CustomerPage({ onClose }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ mode: 'onChange' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers();
      setCustomers(res.data);
    } catch {
      setServerError('Müşteriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    setServerError('');
    reset({ taxNumber: '', title: '', address: '', email: '' });
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setServerError('');
    reset({
      taxNumber: customer.taxNumber || '',
      title: customer.title || '',
      address: customer.address || '',
      email: customer.email || '',
    });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    setServerError('');
    try {
      if (editingCustomer) {
        await updateCustomer({ ...data, customerId: editingCustomer.customerId });
        showSuccess('Müşteri güncellendi.');
      } else {
        await saveCustomer(data);
        showSuccess('Müşteri eklendi.');
      }
      setShowModal(false);
      fetchCustomers();
    } catch {
      setServerError('İşlem sırasında hata oluştu.');
    }
  };

  const handleDelete = async (customer, force = false) => {
    try {
      await deleteCustomer(customer.customerId, force);
      setDeleteConfirm(null);
      showSuccess('Müşteri silindi.');
      fetchCustomers();
    } catch (err) {
      if (err.response?.status === 409) {
        setDeleteConfirm({ ...customer, hasInvoices: true, invoiceCount: err.response.data.invoiceCount });
      } else {
        setServerError('Silme işlemi başarısız.');
      }
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="modal show d-block modal-custom" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Müşteri Yönetimi</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body" style={{ padding: '24px 28px' }}>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <p className="mb-0" style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                Toplam {customers.length} müşteri
              </p>
              <button className="btn-save" onClick={openAddModal}>+ Yeni Müşteri</button>
            </div>

            {successMsg && <div className="alert alert-success alert-custom mb-3">✅ {successMsg}</div>}
            {serverError && <div className="alert alert-danger alert-custom mb-3">⚠️ {serverError}</div>}

            {loading ? (
              <div className="text-center p-4">
                <div className="spinner-border" style={{ color: '#0066CC' }} />
              </div>
            ) : customers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <p>Henüz müşteri eklenmemiş.</p>
              </div>
            ) : (
              <table className="table-custom w-100">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ünvan</th>
                    <th>Vergi No</th>
                    <th>E-posta</th>
                    <th>Adres</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={c.customerId}>
                      <td style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>{i + 1}</td>
                      <td><strong style={{ color: '#111827' }}>{c.title}</strong></td>
                      <td>{c.taxNumber || <span style={{ color: '#9CA3AF' }}>—</span>}</td>
                      <td>{c.email || <span style={{ color: '#9CA3AF' }}>—</span>}</td>
                      <td>{c.address || <span style={{ color: '#9CA3AF' }}>—</span>}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn-edit" onClick={() => openEditModal(c)}>Düzenle</button>
                          <button className="btn-delete" onClick={() => setDeleteConfirm(c)}>Sil</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOMER FORM MODAL */}
      {showModal && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingCustomer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="modal-body">
                  {serverError && <div className="alert alert-danger alert-custom mb-3">⚠️ {serverError}</div>}

                  <div className="mb-3">
                    <label className="form-label-custom">Ünvan *</label>
                    <input
                      className={`form-control form-control-custom ${errors.title ? 'is-invalid' : ''}`}
                      placeholder="Şirket adı"
                      maxLength={200}
                      {...register('title', {
                        required: 'Ünvan zorunludur.',
                        maxLength: { value: 200, message: 'En fazla 200 karakter.' },
                      })}
                    />
                    {errors.title && <div className="invalid-feedback d-block">{errors.title.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label-custom">Vergi Numarası</label>
                    <input
                      className={`form-control form-control-custom ${errors.taxNumber ? 'is-invalid' : ''}`}
                      placeholder="1234567890"
                      maxLength={50}
                      {...register('taxNumber', {
                        pattern: { value: /^[0-9]*$/, message: 'Sadece rakam giriniz.' },
                        maxLength: { value: 50, message: 'En fazla 50 karakter.' },
                      })}
                    />
                    {errors.taxNumber && <div className="invalid-feedback d-block">{errors.taxNumber.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label-custom">E-posta</label>
                    <input
                      type="email"
                      className={`form-control form-control-custom ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="ornek@sirket.com"
                      maxLength={100}
                      {...register('email', {
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Geçerli bir e-posta girin.' },
                      })}
                    />
                    {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label-custom">Adres</label>
                    <textarea
                      className={`form-control form-control-custom ${errors.address ? 'is-invalid' : ''}`}
                      placeholder="Şirket adresi"
                      rows={3}
                      maxLength={500}
                      {...register('address', {
                        maxLength: { value: 500, message: 'En fazla 500 karakter.' },
                      })}
                    />
                    {errors.address && <div className="invalid-feedback d-block">{errors.address.message}</div>}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>İptal</button>
                  <button type="submit" className="btn-save" disabled={isSubmitting}>
                    {isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Kaydediliyor...</> : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="modal show d-block modal-custom" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" style={{ color: '#DC2626' }}>
                  {deleteConfirm.hasInvoices ? '⚠️ Dikkat' : 'Müşteri Silinecek'}
                </h5>
                <button className="btn-close" onClick={() => setDeleteConfirm(null)} />
              </div>
              <div className="modal-body text-center py-4">
                <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.6 }}>
                  {deleteConfirm.hasInvoices ? '⚠️' : '🗑️'}
                </div>
                <p className="mb-2" style={{ fontWeight: 600 }}>{deleteConfirm.title}</p>
                {deleteConfirm.hasInvoices ? (
                  <p style={{ fontSize: '0.875rem', color: '#DC2626' }}>
                    Bu müşteriye ait <strong>{deleteConfirm.invoiceCount} adet fatura</strong> bulunmaktadır.
                    Müşteriyi silmek tüm faturaları da silecektir. Devam etmek istiyor musunuz?
                  </p>
                ) : (
                  <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                    Bu müşteriyi silmek istediğinize emin misiniz?
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setDeleteConfirm(null)}>İptal</button>
                <button
                  className="btn-delete"
                  style={{ padding: '8px 20px', fontWeight: 600 }}
                  onClick={() => handleDelete(deleteConfirm, deleteConfirm.hasInvoices)}
                >
                  {deleteConfirm.hasInvoices ? 'Evet, Hepsini Sil' : 'Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}