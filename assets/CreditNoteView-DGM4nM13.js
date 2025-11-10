import{r as K,d as v,s as p,j as Y,c as a,o as i,a as t,b as Z,w as B,e as tt,f as u,t as o,q as X,F as et,g as st,u as V}from"./index-DsdxD8YF.js";import{S as nt}from"./SectionCard-BmZtNIqG.js";const ot={key:0,class:"row g-3"},at={class:"col-12"},it={class:"d-flex justify-content-between mb-3"},dt={key:0},lt={key:1},rt={key:2,class:"text-muted small"},ct={key:3},ut={key:4,class:"text-muted small"},mt={key:0},pt={key:1},vt={class:"text-end"},ft={key:0},ht={class:"mb-2 info-block"},xt={class:"fw-semibold"},bt={key:0},yt={key:1,class:"text-muted small"},gt={key:2,class:"text-muted small"},_t={key:3,class:"text-muted small"},wt={key:0},Nt={key:1},$t={class:"table table-sm table-invoice align-middle mt-2"},kt={class:"fw-medium"},Tt={key:0,class:"text-muted small"},It={class:"text-end"},Ct={class:"text-end"},Ft={class:"text-end"},St={key:0},At={key:1},Dt={key:2},Mt={class:"text-end"},Pt={class:"mt-2 d-flex"},Vt={class:"totals-card"},jt={class:"line"},Rt={class:"line"},zt={class:"line grand"},qt={key:0,class:"mt-3 invoice-terms"},Lt={class:"text-muted"},Et={key:1,class:"mt-2"},Bt={style:{"white-space":"pre-wrap"}},Xt={key:1,class:"text-muted"},Wt={__name:"CreditNoteView",setup(Ut){const U=Y(),H=tt(),D=K(null),d=v(()=>(p.creditNotes||[]).find(s=>s.id===U.params.id)),y=v(()=>p.merchants.find(s=>s.id===d.value?.merchantId)),N=v(()=>p.customers.find(s=>s.id===d.value?.customerId)),k=v(()=>p.invoices.find(s=>s.id===d.value?.originalInvoiceId)),R=v(()=>y.value?.addresses||[]),z=v(()=>y.value?.contacts||[]),M=v(()=>R.value.find(s=>s.id===d.value?.merchantAddressId)||R.value?.[0]),T=v(()=>z.value.find(s=>s.id===d.value?.merchantContactId)||z.value?.[0]),q=v(()=>N.value?.addresses||[]),L=v(()=>N.value?.contacts||[]),j=v(()=>q.value.find(s=>s.id===d.value?.customerAddressId)||q.value?.[0]),I=v(()=>L.value.find(s=>s.id===d.value?.customerContactId)||L.value?.[0]);function C(s){const e=(Number(s.qty)||0)*(Number(s.unitPrice)||0),n=s.discountType||"none",m=Number(s.discountValue)||0,g=n==="percent"?e*m/100:n==="fixed"?(Number(s.qty)||0)*m:0;return Math.max(0,e-g)}const x=v(()=>{const s=d.value;if(!s)return{sub:0,tax:0,total:0};let e=0,n=0;for(const m of s.items||[]){const g=C(m);e+=g;const $=p.taxes.find(r=>r.id===m.taxId);$&&(n+=g*(Number($.rate)||0)/100)}return{sub:e,tax:n,total:e+n}});function Q(){d.value&&H.push(`/credit-notes/${d.value.id}/edit`)}function W(){if(!D?.value)return;const s=D.value.outerHTML,e=window.open("","_blank","noopener,noreferrer");e&&(e.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>${d.value?.number||"Credit Note"}</title>
        <link rel="stylesheet" href="https://bootswatch.com/5/pulse/bootstrap.min.css"/>
        <style>
          @page { size: A4; margin: 10mm; }
          body { background:#fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
          .print-area { width: 190mm; margin: 0 auto; padding: 10mm; border: none; }
          .print-area h4 { font-size: 20px; color: #4a148c; }
          .print-area table { font-size: 12px; }
        </style>
      </head>
      <body>
        ${s}
        <script>
          window.addEventListener('load', function(){
            setTimeout(function(){
              try { window.focus(); window.print(); } finally { window.close(); }
            }, 150);
          });
        <\/script>
      </body>
    </html>
  `),e.document.close())}function O(){const s=d.value;if(!s)return;const e=y.value,n=N.value,m=Number(x.value.sub.toFixed(2)),g=Number(x.value.tax.toFixed(2)),$=Number(x.value.total.toFixed(2)),r=(s.items||[]).reduce((c,b)=>{const F=(Number(b.qty)||0)*(Number(b.unitPrice)||0),h=C(b);return c+Math.max(0,F-h)},0);function _(c){const b=["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],F=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];function h(l){return l<20?b[l]:l<100?F[Math.floor(l/10)]+(l%10?" "+b[l%10]:""):l<1e3?b[Math.floor(l/100)]+" hundred"+(l%100?" "+h(l%100):""):l<1e6?h(Math.floor(l/1e3))+" thousand"+(l%1e3?" "+h(l%1e3):""):l<1e9?h(Math.floor(l/1e6))+" million"+(l%1e6?" "+h(l%1e6):""):String(l)}const S=Math.floor(c),P=Math.round((c-S)*100);let A=S===0?"zero":h(S);return P&&(A+=` and ${P}/100`),A.charAt(0).toUpperCase()+A.slice(1)}const f=_($)+" only",J=(s.items||[]).map((c,b)=>{const F=p.products.find(l=>l.id===c.productId)?.name||c.description||"—",h=Number(c.qty||0),S=Number(c.unitPrice||0).toFixed(2),P=Number(C(c)||0).toFixed(2),A=(c.discountType||"none")==="percent"?` · -${Number(c.discountValue||0).toFixed(0)}%`:(c.discountType||"none")==="fixed"?` · -${(Number(c.discountValue||0)*Number(c.qty||0)).toFixed(2)}`:"";return`
      <tr>
        <td class="sl">${String(b+1).padStart(2,"0")}</td>
        <td class="desc">
          <div class="nm">${F}</div>
          <div class="muted small">${h} x ${S}${A}</div>
        </td>
        <td class="amt">${P}</td>
      </tr>
    `}).join(""),w=window.open("","_blank","noopener,noreferrer");if(!w)return;w.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Credit Note ${s.number||""}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          html, body { margin: 0; padding: 0; background: #fff; }
          body { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; }
          .rcpt { width: 80mm; padding: 4mm 3mm 8mm; box-sizing: border-box; color: #000; font-size: 12px; }
          .center { text-align: center; }
          .title { font-weight: 700; letter-spacing: .5px; }
          .muted { color: #444; }
          .small { font-size: 11px; }
          hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 2px 0; }
          th { text-align: left; font-weight: 700; }
          .items .sl { width: 18px; }
          .items .desc .nm { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 52mm; }
          .items .amt { text-align: right; white-space: nowrap; }
          .totals .line { display: flex; justify-content: space-between; }
          .totals .grand { font-weight: 700; }
          @media print { .no-print { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="rcpt">
          <div class="center">
            <div class="title">${e?.name||""}</div>
            ${e?.addresses?.[0]?`<div class="small muted">${e.addresses[0].line1}, ${e.addresses[0].city}</div>`:""}
            ${e?.taxId?`<div class="small muted">VAT/TAX: ${e.taxId}</div>`:""}
          </div>

          <hr />
          <div class="center title">CREDIT NOTE</div>
          <div class="line small" style="display:flex;justify-content:space-between;"><span>No:</span><span>${s.number||""}</span></div>
          <div class="line small" style="display:flex;justify-content:space-between;"><span>Date:</span><span>${s.date||""}</span></div>
          ${k.value?`<div class="line small" style="display:flex;justify-content:space-between;"><span>Ref Inv:</span><span>${k.value.number}</span></div>`:""}
          ${n?.name?`<div class="line small" style="display:flex;justify-content:space-between;"><span>Customer:</span><span>${n.name}</span></div>`:""}
          ${s.reason?`<div class="small muted">Reason: ${s.reason}</div>`:""}

          <hr />

          <table class="items">
            <thead>
              <tr>
                <th class="sl">SL</th>
                <th>Item Description</th>
                <th class="amt">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${J||'<tr><td colspan="3" class="small muted">No items</td></tr>'}
            </tbody>
          </table>

          <hr />

          <div class="totals">
            <div class="line"><span>Subtotal</span><span>${m.toFixed(2)}</span></div>
            ${r>0?`<div class="line"><span>Discount</span><span>-${r.toFixed(2)}</span></div>`:""}
            <div class="line"><span>VAT</span><span>${g.toFixed(2)}</span></div>
            <div class="line grand"><span>Total Credit</span><span>${$.toFixed(2)}</span></div>
          </div>

          <hr />

          <div class="small"><strong>In words:</strong> ${f}</div>

          <hr />

          ${p.settings?.creditNote?.footerText?`<div class="center small muted">${p.settings.creditNote.footerText}</div>`:""}
          <div class="center small" style="margin-top:6px">Thank you!</div>
        </div>

        <script>
          window.addEventListener('load', function(){
            setTimeout(function(){
              try { window.focus(); window.print(); } finally { window.close(); }
            }, 120);
          });
        <\/script>
      </body>
    </html>
  `),w.document.close();try{w.focus()}catch{}const E=()=>setTimeout(()=>{try{w.focus(),w.print()}catch{}},300);w.document.readyState==="complete"?E():w.addEventListener("load",E)}async function G(){if(!D?.value||!d.value)return;async function s(){return window.pdfMake||(await new Promise((r,_)=>{const f=document.createElement("script");f.src="https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/pdfmake.min.js",f.onload=r,f.onerror=_,document.body.appendChild(f)}),await new Promise((r,_)=>{const f=document.createElement("script");f.src="https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/vfs_fonts.min.js",f.onload=r,f.onerror=_,document.body.appendChild(f)})),window.pdfMake}await s();const e=d.value,n=y.value,m=N.value,g=[[{text:"Product / Description",bold:!0},{text:"Qty",alignment:"right",bold:!0},{text:"Unit",alignment:"right",bold:!0},{text:"Discount",alignment:"right",bold:!0},{text:"Line",alignment:"right",bold:!0}],...(e.items||[]).map(r=>[p.products.find(_=>_.id===r.productId)?.name||r.description||"—",{text:String(r.qty||0),alignment:"right"},{text:Number(r.unitPrice||0).toFixed(2),alignment:"right"},{text:(r.discountType||"none")==="percent"?"-"+Number(r.discountValue||0).toFixed(0)+"%":(r.discountType||"none")==="fixed"?"- "+(Number(r.discountValue||0)*Number(r.qty||0)).toFixed(2):"—",alignment:"right"},{text:C(r).toFixed(2),alignment:"right"}])],$={pageSize:"A4",pageMargins:[28,28,28,28],content:[{columns:[[{text:n?.name||"",bold:!0},{text:n?.addresses?.length?`${n.addresses[0].line1}, ${n.addresses[0].city}`:""},n?.taxId?{text:`VAT/TAX ID: ${n.taxId}`,color:"#6c757d",fontSize:9}:{}],[{text:"Credit Note",style:"title",alignment:"right"},{text:`No: ${e.number}`,bold:!0,alignment:"right"},{text:`Date: ${e.date}`,alignment:"right"},k.value?{text:`Ref Invoice: ${k.value.number}`,alignment:"right"}:{}]]},{text:" ",margin:[0,6]},{text:"Bill To",bold:!0},{text:m?.name||""},{text:m?.addresses?.length?`${m.addresses[0].line1}, ${m.addresses[0].city}`:""},e.reason?{text:`Reason: ${e.reason}`,margin:[0,6,0,0]}:{},{table:{headerRows:1,widths:["*",40,50,55,60],body:g},layout:"lightHorizontalLines",margin:[0,6,0,0]},{columns:[{text:" "},{width:180,alignment:"right",stack:[{text:`Subtotal: ${x.value.sub.toFixed(2)}`},{text:`Tax: ${x.value.tax.toFixed(2)}`},{text:`Total Credit: ${x.value.total.toFixed(2)}`,bold:!0}]}],margin:[0,8,0,0]}],footer:(r,_)=>({margin:[28,8,28,16],fontSize:9,text:p.settings?.creditNote?.footerText||""}),styles:{title:{fontSize:18,color:"#4a148c",bold:!0}},defaultStyle:{fontSize:10}};window.pdfMake.createPdf($).download(`credit_note_${e.number||"view"}.pdf`)}return(s,e)=>d.value?(i(),a("div",ot,[t("div",at,[Z(nt,{title:`Credit Note ${d.value.number}`},{actions:B(()=>[t("div",{class:"btn-group btn-group-sm"},[t("button",{class:"btn btn-outline-secondary",onClick:Q},"Edit"),t("button",{class:"btn btn-outline-secondary",onClick:W},"Print"),t("button",{class:"btn btn-outline-secondary",onClick:O},"Receipt"),t("button",{class:"btn btn-primary",onClick:G},"Download PDF")])]),default:B(()=>[t("div",{class:"print-area",ref_key:"printRef",ref:D},[t("div",it,[t("div",null,[t("strong",null,o(y.value?.name),1),e[0]||(e[0]=t("br",null,null,-1)),M.value?(i(),a("span",dt,o(M.value.line1)+", "+o(M.value.city),1)):u("",!0),M.value?(i(),a("br",lt)):u("",!0),y.value?.taxId?(i(),a("span",rt,"VAT/TAX ID: "+o(y.value.taxId),1)):u("",!0),y.value?.taxId?(i(),a("br",ct)):u("",!0),T.value?(i(),a("span",ut,[X(o(T.value.name),1),T.value.email?(i(),a("span",mt," · "+o(T.value.email),1)):u("",!0),T.value.phone?(i(),a("span",pt," · "+o(T.value.phone),1)):u("",!0)])):u("",!0)]),t("div",vt,[e[1]||(e[1]=t("h4",{class:"mb-1"},"Credit Note",-1)),t("div",null,[t("strong",null,"No: "+o(d.value.number),1)]),t("div",null,"Date: "+o(d.value.date),1),k.value?(i(),a("div",ft,"Ref Invoice: "+o(k.value?.number),1)):u("",!0)])]),t("div",ht,[e[2]||(e[2]=t("div",{class:"text-uppercase muted-label"},"Bill To",-1)),t("div",xt,o(N.value?.name),1),j.value?(i(),a("div",bt,o(j.value.line1)+", "+o(j.value.city),1)):u("",!0),N.value?.taxId?(i(),a("div",yt,"VAT/TAX ID: "+o(N.value.taxId),1)):u("",!0),d.value.reason?(i(),a("div",gt,"Reason: "+o(d.value.reason),1)):u("",!0),I.value?(i(),a("div",_t,[X(o(I.value.name),1),I.value.email?(i(),a("span",wt," · "+o(I.value.email),1)):u("",!0),I.value.phone?(i(),a("span",Nt," · "+o(I.value.phone),1)):u("",!0)])):u("",!0)]),t("table",$t,[e[3]||(e[3]=t("thead",{class:"table-light"},[t("tr",null,[t("th",null,"Product / Description"),t("th",{class:"text-end"},"Qty"),t("th",{class:"text-end"},"Unit"),t("th",{class:"text-end"},"Discount"),t("th",{class:"text-end"},"Line")])],-1)),t("tbody",null,[(i(!0),a(et,null,st(d.value.items,n=>(i(),a("tr",{key:n.id},[t("td",null,[t("div",kt,o(V(p).products.find(m=>m.id===n.productId)?.name||n.description||"—"),1),n.description&&V(p).products.find(m=>m.id===n.productId)?.name!==n.description?(i(),a("div",Tt,o(n.description),1)):u("",!0)]),t("td",It,o(n.qty),1),t("td",Ct,o(Number(n.unitPrice||0).toFixed(2)),1),t("td",Ft,[(n.discountType||"none")==="percent"?(i(),a("span",St,"-"+o(Number(n.discountValue||0).toFixed(0))+"%",1)):(n.discountType||"none")==="fixed"?(i(),a("span",At,"-"+o((Number(n.discountValue||0)*Number(n.qty||0)).toFixed(2)),1)):(i(),a("span",Dt,"—"))]),t("td",Mt,o(C(n).toFixed(2)),1)]))),128))])]),t("div",Pt,[e[7]||(e[7]=t("div",{class:"flex-grow-1"},null,-1)),t("div",Vt,[t("div",jt,[e[4]||(e[4]=t("span",null,"Subtotal",-1)),t("span",null,o(x.value.sub.toFixed(2)),1)]),t("div",Rt,[e[5]||(e[5]=t("span",null,"Tax",-1)),t("span",null,o(x.value.tax.toFixed(2)),1)]),t("div",zt,[e[6]||(e[6]=t("span",null,"Total Credit",-1)),t("span",null,o(x.value.total.toFixed(2)),1)])])]),V(p).settings?.creditNote?.footerText?(i(),a("div",qt,[t("div",Lt,o(V(p).settings.creditNote.footerText),1)])):u("",!0),d.value.notes?(i(),a("div",Et,[e[8]||(e[8]=t("strong",null,"Notes",-1)),t("div",Bt,o(d.value.notes),1)])):u("",!0)],512)]),_:1},8,["title"])])])):(i(),a("div",Xt,"Credit Note not found."))}};export{Wt as default};
