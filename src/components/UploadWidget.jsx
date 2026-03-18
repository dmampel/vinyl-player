import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X } from 'lucide-react';

export default function UploadWidget({ isDesktop, uploadExpanded, setUploadExpanded, handleUpload }) {
    return (
        <motion.div
            animate={{
                width: (!isDesktop || uploadExpanded) ? (typeof window !== 'undefined' && window.innerWidth >= 640 ? 320 : 380) : 56,
                height: (!isDesktop || uploadExpanded) ? 220 : 56,
                borderRadius: (!isDesktop || uploadExpanded) ? 32 : 50,
                backgroundColor: (!isDesktop || uploadExpanded) ? '#fafafa' : '#111'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onMouseLeave={() => isDesktop && setUploadExpanded(false)}
            className={`border-[1.5px] border-gray-300 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] ${uploadExpanded ? 'border-dashed hover:bg-white' : 'border-solid border-transparent shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:scale-110'}`}
            style={{ padding: uploadExpanded ? '2rem' : '0' }}
        >

            <AnimatePresence mode="wait">
                {(!isDesktop || uploadExpanded) ? (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col items-center justify-center text-center w-full h-full"
                    >
                        <div className="pointer-events-auto w-full flex flex-col items-center" onPointerDownCapture={(e) => e.stopPropagation()}>
                            <label className="cursor-pointer flex flex-col items-center w-full">
                                <div className="w-[3rem] h-[3rem] rounded-full bg-[#111] flex items-center justify-center mb-6 shadow-xl relative ring-[10px] ring-gray-100/50 hover:scale-105 transition-transform">
                                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                </div>
                                <h3 className="text-[15px] font-bold text-gray-800 mb-1.5 hover:text-[#111]">Arrastra archivos</h3>
                                <p className="text-[13px] text-gray-400 mb-4 font-medium">o haz clic aquí</p>
                                <input type="file" className="hidden" multiple accept="audio/*" onChange={handleUpload} />
                            </label>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="compact"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setUploadExpanded(true)}
                        onMouseEnter={() => setUploadExpanded(true)}
                        className="w-full h-full flex items-center justify-center text-white cursor-pointer pointer-events-auto"
                        title="Expandir área de subida"
                    >
                        <Upload className="w-6 h-6" />
                    </motion.div>
                )}
            </AnimatePresence>

        </motion.div>
    )
}