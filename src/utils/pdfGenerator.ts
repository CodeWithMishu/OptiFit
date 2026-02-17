import type { UserFormData, FaceDetectionResult } from '@/types';

export async function generatePrescriptionPDF(
  formData: UserFormData,
  faceResult: FaceDetectionResult
): Promise<void> {
  const { faceShape, frameSize, frameSuggestion, measurements, confidence } = faceResult;

  const rx = formData.prescription;
  const fmtEye = (eye: typeof rx.rightEye) => {
    const parts: string[] = [];
    if (eye.spherical != null && !isNaN(eye.spherical)) parts.push(`SPH: ${eye.spherical > 0 ? '+' : ''}${eye.spherical.toFixed(2)}`);
    if (eye.cylindrical != null && !isNaN(eye.cylindrical)) parts.push(`CYL: ${eye.cylindrical > 0 ? '+' : ''}${eye.cylindrical.toFixed(2)}`);
    if (eye.axis != null && !isNaN(eye.axis)) parts.push(`Axis: ${eye.axis}\u00B0`);
    if (eye.prism != null && !isNaN(eye.prism)) parts.push(`Prism: ${eye.prism}`);
    if (eye.base) parts.push(`Base: ${eye.base}`);
    return parts.length ? parts.join('  |  ') : 'N/A';
  };

  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>OptiFit AI - Prescription Report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 18mm; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #667eea; padding-bottom: 12px; margin-bottom: 20px; }
  .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
  .date { color: #666; font-size: 13px; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 15px; font-weight: 700; color: #667eea; border-bottom: 1.5px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
  .field { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dotted #e5e7eb; }
  .field-label { color: #666; font-size: 13px; }
  .field-value { font-weight: 600; font-size: 13px; text-align: right; }
  .rx-box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; margin-bottom: 10px; }
  .rx-label { font-size: 12px; font-weight: 700; color: #667eea; margin-bottom: 6px; }
  .rx-values { font-family: 'Courier New', monospace; font-size: 13px; color: #333; }
  .highlight-box { background: linear-gradient(135deg, #eff6ff, #ede9fe); border: 1.5px solid #a5b4fc; border-radius: 10px; padding: 16px; text-align: center; margin: 16px 0; }
  .shape-label { font-size: 26px; font-weight: 800; color: #667eea; }
  .confidence { font-size: 12px; color: #666; margin-top: 4px; }
  .frames-section { margin-top: 12px; }
  .frame-tag { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 3px 4px; }
  .frame-tag.good { background: linear-gradient(135deg, #11998e, #38ef7d); }
  .measurements { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
  .m-box { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px; text-align: center; }
  .m-val { font-size: 18px; font-weight: 700; color: #1a1a2e; }
  .m-unit { font-size: 11px; color: #666; }
  .m-label { font-size: 10px; color: #999; margin-top: 2px; }
  .footer { margin-top: 30px; border-top: 2px solid #e5e7eb; padding-top: 12px; text-align: center; color: #999; font-size: 11px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page { padding: 15mm; } }
</style>
</head><body>
<div class="page">
  <div class="header">
    <div class="logo">OptiFit AI</div>
    <div class="date">Report Date: ${dateStr}</div>
  </div>

  <div class="section">
    <div class="section-title">Patient Information</div>
    <div class="grid">
      <div class="field"><span class="field-label">Name</span><span class="field-value">${formData.name}</span></div>
      <div class="field"><span class="field-label">Age</span><span class="field-value">${formData.age} yrs</span></div>
      <div class="field"><span class="field-label">Gender</span><span class="field-value">${formData.gender}</span></div>
      <div class="field"><span class="field-label">DOB</span><span class="field-value">${new Date(formData.dob).toLocaleDateString('en-IN')}</span></div>
      <div class="field"><span class="field-label">Mobile</span><span class="field-value">${formData.mobile}</span></div>
      <div class="field"><span class="field-label">Ward No</span><span class="field-value">${formData.wardNo || '-'}</span></div>
      ${formData.address ? `<div class="field" style="grid-column:1/3"><span class="field-label">Address</span><span class="field-value">${formData.address}</span></div>` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Prescription</div>
    <div class="rx-box">
      <div class="rx-label">Right Eye (O.D)</div>
      <div class="rx-values">${fmtEye(rx.rightEye)}</div>
    </div>
    <div class="rx-box">
      <div class="rx-label">Left Eye (O.S)</div>
      <div class="rx-values">${fmtEye(rx.leftEye)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">AI Face Analysis</div>
    <div class="highlight-box">
      <div class="shape-label">${faceShape} Face Shape</div>
      <div class="confidence">Confidence: ${confidence}% &nbsp;|&nbsp; Frame Size: ${frameSize}</div>
    </div>

    <div class="measurements">
      <div class="m-box"><div class="m-val">${measurements.faceLengthMm}<span class="m-unit"> mm</span></div><div class="m-label">Face Length</div></div>
      <div class="m-box"><div class="m-val">${measurements.foreheadWidthMm}<span class="m-unit"> mm</span></div><div class="m-label">Forehead</div></div>
      <div class="m-box"><div class="m-val">${measurements.cheekboneWidthMm}<span class="m-unit"> mm</span></div><div class="m-label">Cheekbone</div></div>
      <div class="m-box"><div class="m-val">${measurements.jawWidthMm}<span class="m-unit"> mm</span></div><div class="m-label">Jaw Width</div></div>
      <div class="m-box"><div class="m-val">${measurements.templeWidthMm}<span class="m-unit"> mm</span></div><div class="m-label">Temple</div></div>
      <div class="m-box"><div class="m-val">${measurements.noseBridgeWidthMm}<span class="m-unit"> mm</span></div><div class="m-label">Nose Bridge</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Recommended Frames</div>
    <div class="frames-section">
      <p style="font-size:12px;color:#666;margin-bottom:8px;">Best Match:</p>
      ${frameSuggestion.filter(f => f.priority === 'best').map(f => `<span class="frame-tag">${f.type}</span>`).join('')}
      <p style="font-size:12px;color:#666;margin:8px 0;">Good Match:</p>
      ${frameSuggestion.filter(f => f.priority === 'good').map(f => `<span class="frame-tag good">${f.type}</span>`).join('')}
    </div>
  </div>

  <div class="footer">
    <p>Generated by OptiFit AI &mdash; Intelligent Optical Frame Recommendation System</p>
    <p style="margin-top:4px;">This report is computer-generated. Please consult your optometrist for final prescription verification.</p>
  </div>
</div>
</body></html>`;

  // Open in new window for print/save as PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
