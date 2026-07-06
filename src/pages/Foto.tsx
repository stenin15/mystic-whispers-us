import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HandImageUpload } from '@/components/shared/HandImageUpload';
import { useHandReadingStore } from '@/store/useHandReadingStore';
import { cn, compressImageForVision } from '@/lib/utils';
import { track, getOrCreateEventId } from '@/lib/tracking';
import { getAttributionParams, getStoredAngle, getStoredFocus } from '@/lib/marketing';

const Foto = () => {
  const navigate = useNavigate();
  const { name, setFormData, canAccessAnalysis, quizAnswers, handPhotoData } = useHandReadingStore();
  const [preview, setPreview] = useState(() => handPhotoData || '');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard: must have completed quiz first
  if (quizAnswers.length < 5) {
    navigate('/quiz', { replace: true });
    return null;
  }

  const handlePhotoChange = async (url: string) => {
    setPreview(url);
    setIssue('');
    setFormData({ hasHandPhoto: !!url });
    if (url) {
      try {
        const compressed = await compressImageForVision(url);
        setFormData({ handPhotoData: compressed });
      } catch {
        setFormData({ handPhotoData: url });
      }
    } else {
      setFormData({ handPhotoData: null });
    }
  };

  const handleContinue = async () => {
    if (!preview) {
      setIssue('Please upload a clear photo of your palm to continue');
      return;
    }
    setLoading(true);
    track('PhotoSubmit', {
      event_id: getOrCreateEventId('photo_submit'),
      page_path: '/foto',
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
    navigate('/analise');
  };

  const handleSkip = () => {
    track('PhotoSkipped', {
      event_id: getOrCreateEventId('photo_skipped'),
      page_path: '/foto',
      angle: getStoredAngle(),
      focus: getStoredFocus(),
      ...getAttributionParams(),
    });
    navigate('/analise');
  };

  const firstName = name?.trim().split(' ')[0] || 'there';

  return (
    <div className="min-h-screen relative overflow-hidden py-20 px-4" style={{ background: "linear-gradient(170deg, #0a0812 0%, #080810 40%, #06060e 100%)" }}>

      <div className="container max-w-xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-sm text-primary">Aurora is analyzing 47 readings right now</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">
            <span className="gradient-text">One photo away from your answer</span>
          </h1>
          <p className="text-muted-foreground/80 max-w-md mx-auto">
            {firstName}, the quiz revealed your pattern — now Aurora needs to see your specific lines to complete the reading. This is what makes it personal, not generic.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-6 rounded-2xl bg-card/30 backdrop-blur-xl border border-border/20 space-y-5"
        >
          <HandImageUpload
            value={preview}
            onChange={handlePhotoChange}
            issue={issue}
          />

          <p className="text-[11px] text-muted-foreground/40 text-center">
            Open hand · Natural light · No filter needed
          </p>

          {preview && (
            <p className="text-sm text-primary/80 text-center">
              ✓ Palm photo received — Aurora is ready to begin.
            </p>
          )}

          <p className="text-xs text-muted-foreground/50 text-center">
            Your photo is processed privately and used only to create your reading — never shared or sold.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-6"
        >
          <Button
            onClick={handleContinue}
            size="lg"
            disabled={loading}
            className={cn(
              "gradient-mystic text-primary-foreground hover:opacity-90 glow-mystic px-10 py-6 text-lg",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start my reading
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <button
            onClick={handleSkip}
            className="block mx-auto mt-5 text-sm text-muted-foreground/50 hover:text-muted-foreground underline underline-offset-4 transition-colors"
          >
            Skip for now — continue without a photo →
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Foto;
