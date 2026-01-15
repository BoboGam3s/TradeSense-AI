import { useState, useEffect } from 'react';
import { FiX, FiSave, FiTag, FiFileText } from 'react-icons/fi';

export default function JournalModal({ isOpen, onClose, trade, onSave }) {
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trade) {
      setNotes(trade.notes || '');
      setTags(Array.isArray(trade.tags) ? trade.tags.join(', ') : (trade.tags || ''));
    }
  }, [trade]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Convert comma-separated tags to array and back to ensure clean formatting
    const formattedTags = tags.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .join(',');

    await onSave(trade.id, { notes, tags: formattedTags });
    setLoading(false);
    onClose();
  };

  if (!isOpen || !trade) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <FiFileText className="mr-2 text-neon-blue" />
              Journal de Trading
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Trade #{trade.id} • {trade.symbol} • {new Date(trade.timestamp).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center">
              <FiFileText className="mr-2" /> Notes d'analyse
            </label>
            <textarea
              className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:border-neon-blue/50 transition-all min-h-[150px] resize-y"
              placeholder="Pourquoi avez-vous pris ce trade ? Quelle était votre stratégie ? Émotions ressenties ?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center">
              <FiTag className="mr-2" /> Tags (séparés par des virgules)
            </label>
            <input
              type="text"
              className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-gray-300 focus:outline-none focus:border-neon-blue/50 transition-all"
              placeholder="Ex: FOMO, Breakout, News, Scalping"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.split(',').map(tag => tag.trim()).filter(t => t).map((tag, idx) => (
                <span key={idx} className="text-[10px] bg-neon-blue/10 text-neon-blue px-2 py-1 rounded font-bold border border-neon-blue/20">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white mr-4 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center px-6 py-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <FiSave className="mr-2" />
              )}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
