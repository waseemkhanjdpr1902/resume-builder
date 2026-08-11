
import { useParams } from 'react-router-dom';
import { useLayout } from '../provider/layoutProvider';
import { Button } from './CustomComponents'
import { FiUploadCloud } from 'react-icons/fi';

const UploadResumeCard = ({ children }) => {

    const { handleFilePick, fileInputRef, handleFileChange } = useLayout();
    const { layout_type, layout_id } = useParams()

    return (
        <>
            <div className="resume-import-card">
                <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    accept="application/pdf"
                    data-layout-type={layout_type || ""}
                    data-layout-id={layout_id || ""}
                    onChange={handleFileChange}
                />
                <div className="import-icon"><FiUploadCloud /></div>
                <div><strong>Speed things up with your current CV</strong><p>Upload a PDF and we’ll extract the details into this template.</p></div>
                <Button onClick={handleFilePick}>Import PDF</Button>
            </div>
            {children}
        </>
    )
}

export default UploadResumeCard
