export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
    return (
        <div className="modal-backdrop">
            <div className="modal">
                <div className="modal-header">
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                        {title}
                    </h3>
                </div>

                <p style={{ color: '#d1d5db', marginBottom: 20 }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                        className="button"
                        onClick={onCancel}
                        style={{ background: '#64748b' }}
                    >
                        Cancelar
                    </button>
                    <button
                        className="button"
                        onClick={onConfirm}
                        style={{ background: '#ef4444' }}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}