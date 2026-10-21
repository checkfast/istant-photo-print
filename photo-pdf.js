'use strict';
// PDF 1.4: una pagina 4x6 pollici, JPEG incorporato senza ricampionamento.
function photoPDF(dataURL) {
 const encoded=dataURL.split(',')[1];
 if(!dataURL.startsWith('data:image/jpeg;base64,')||!encoded)throw new Error('JPEG non valido');
 const binary=atob(encoded), jpg=Uint8Array.from(binary,c=>c.charCodeAt(0));
 const enc=new TextEncoder(),parts=[],offsets=[0];let length=0;
 function add(value){const bytes=typeof value==='string'?enc.encode(value):value;parts.push(bytes);length+=bytes.length;}
 function object(n,body){offsets[n]=length;add(n+' 0 obj\n');add(body);add('\nendobj\n');}
 add('%PDF-1.4\n');
 object(1,'<< /Type /Catalog /Pages 2 0 R >>');
 object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 288 432] /CropBox [0 0 288 432] /Resources << /XObject << /Photo 4 0 R >> >> /Contents 5 0 R >>');
 offsets[4]=length;add('4 0 obj\n<< /Type /XObject /Subtype /Image /Width 1200 /Height 1800 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n');add(jpg);add('\nendstream\nendobj\n');
 const commands='q\n288 0 0 432 0 0 cm\n/Photo Do\nQ\n';
 object(5,'<< /Length '+enc.encode(commands).length+' >>\nstream\n'+commands+'endstream');
 const xref=length;add('xref\n0 6\n0000000000 65535 f \n');
 for(let n=1;n<=5;n++)add(String(offsets[n]).padStart(10,'0')+' 00000 n \n');
 add('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n');
 return new Blob(parts,{type:'application/pdf'});
}
