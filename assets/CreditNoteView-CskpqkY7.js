var W=(G,H,R)=>new Promise((I,d)=>{var N=F=>{try{h(R.next(F))}catch(q){d(q)}},C=F=>{try{h(R.throw(F))}catch(q){d(q)}},h=F=>F.done?I(F.value):Promise.resolve(F.value).then(N,C);h((R=R.apply(G,H)).next())});import{u as at,s as it,v as lt,b as _,d as o,o as a,p as dt,l as O,e as t,j as r,t as s,C as M,F as Y,g as Z,m as A,n as rt}from"./vendor-CJczNIjx.js";import{S as ut}from"./SectionCard-C9PBNAnP.js";import{_ as ct,s as x}from"./index-CYiN_h_V.js";const mt={key:0},vt={class:"d-flex align-items-center gap-3"},pt={class:"detail-section"},xt={class:"detail-grid"},bt={class:"detail-item"},ft={class:"detail-value large"},_t={class:"detail-item"},ht={class:"detail-value"},yt={key:0,class:"detail-item"},gt={class:"detail-value"},wt={key:1,class:"detail-item"},kt={class:"detail-value"},Nt={class:"detail-section"},$t={class:"detail-grid",style:{"grid-template-columns":"repeat(auto-fit, minmax(300px, 1fr))"}},Tt={class:"detail-item"},It={class:"detail-value"},Ct={class:"fw-semibold"},Ft={key:0,class:"text-muted small mt-1"},St={key:1,class:"text-muted small mt-1"},Pt={key:0},At={key:1},Dt={class:"detail-item"},Vt={class:"detail-value"},Mt={class:"fw-semibold"},zt={key:0,class:"text-muted small mt-1"},jt={key:1,class:"text-muted small mt-1"},Rt={key:0},qt={key:1},Lt={class:"detail-section"},Et={class:"table-responsive"},Bt={class:"table table-sm table-invoice align-middle"},Ut={class:"fw-medium"},Xt={key:0,class:"text-muted small"},Qt={class:"text-end"},Ht={class:"text-end"},Wt={class:"text-end"},Ot={key:0},Gt={key:1},Jt={key:2},Kt={class:"text-end fw-semibold"},Yt={key:0},Zt={class:"detail-section"},te={class:"totals-container"},ee={class:"totals-grid"},se={class:"totals-row"},ne={class:"totals-value"},oe={class:"totals-row"},ae={class:"totals-value"},ie={class:"totals-row totals-grand"},le={class:"totals-value"},de={key:0,class:"detail-section"},re={key:0,class:"mb-3"},ue={class:"detail-value"},ce={key:1},me={class:"detail-value",style:{"white-space":"pre-wrap"}},ve={class:"d-flex justify-content-between mb-3"},pe={key:0},xe={key:1},be={key:2,class:"text-muted small"},fe={key:3},_e={key:4,class:"text-muted small"},he={key:0},ye={key:1},ge={class:"text-end"},we={key:0},ke={class:"mb-2 info-block"},Ne={class:"fw-semibold"},$e={key:0},Te={key:1,class:"text-muted small"},Ie={key:2,class:"text-muted small"},Ce={key:3,class:"text-muted small"},Fe={key:0},Se={key:1},Pe={class:"table table-sm table-invoice align-middle mt-2"},Ae={class:"fw-medium"},De={key:0,class:"text-muted small"},Ve={class:"text-end"},Me={class:"text-end"},ze={class:"text-end"},je={key:0},Re={key:1},qe={key:2},Le={class:"text-end"},Ee={class:"mt-2 d-flex"},Be={class:"totals-card"},Ue={class:"line"},Xe={class:"line"},Qe={class:"line grand"},He={key:0,class:"mt-3 invoice-terms"},We={class:"text-muted"},Oe={key:1,class:"mt-2"},Ge={style:{"white-space":"pre-wrap"}},Je={key:1,class:"empty-state"},Ke={__name:"CreditNoteView",setup(G){const H=at(),R=it(),I=lt(null),d=_(()=>(x.creditNotes||[]).find(n=>n.id===H.params.id)),N=_(()=>x.merchants.find(n=>{var e;return n.id===((e=d.value)==null?void 0:e.merchantId)})),C=_(()=>x.customers.find(n=>{var e;return n.id===((e=d.value)==null?void 0:e.customerId)})),h=_(()=>x.invoices.find(n=>{var e;return n.id===((e=d.value)==null?void 0:e.originalInvoiceId)})),F=_(()=>{var n;return((n=N.value)==null?void 0:n.addresses)||[]}),q=_(()=>{var n;return((n=N.value)==null?void 0:n.contacts)||[]}),D=_(()=>{var n;return F.value.find(e=>{var i;return e.id===((i=d.value)==null?void 0:i.merchantAddressId)})||((n=F.value)==null?void 0:n[0])}),y=_(()=>{var n;return q.value.find(e=>{var i;return e.id===((i=d.value)==null?void 0:i.merchantContactId)})||((n=q.value)==null?void 0:n[0])}),J=_(()=>{var n;return((n=C.value)==null?void 0:n.addresses)||[]}),K=_(()=>{var n;return((n=C.value)==null?void 0:n.contacts)||[]}),z=_(()=>{var n;return J.value.find(e=>{var i;return e.id===((i=d.value)==null?void 0:i.customerAddressId)})||((n=J.value)==null?void 0:n[0])}),g=_(()=>{var n;return K.value.find(e=>{var i;return e.id===((i=d.value)==null?void 0:i.customerContactId)})||((n=K.value)==null?void 0:n[0])});function L(n){const e=(Number(n.qty)||0)*(Number(n.unitPrice)||0),i=n.discountType||"none",p=Number(n.discountValue)||0,$=i==="percent"?e*p/100:i==="fixed"?(Number(n.qty)||0)*p:0;return Math.max(0,e-$)}const w=_(()=>{const n=d.value;if(!n)return{sub:0,tax:0,total:0};let e=0,i=0;for(const p of n.items||[]){const $=L(p);e+=$;const S=x.taxes.find(P=>P.id===p.taxId);S&&(i+=$*(Number(S.rate)||0)/100)}return{sub:e,tax:i,total:e+i}});function tt(){d.value&&R.push(`/credit-notes/${d.value.id}/edit`)}function et(){var i;if(!(I!=null&&I.value))return;const n=I.value.outerHTML,e=window.open("","_blank","noopener,noreferrer");e&&(e.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>${((i=d.value)==null?void 0:i.number)||"Credit Note"}</title>
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
        ${n}
        <script>
          window.addEventListener('load', function(){
            setTimeout(function(){
              try { window.focus(); window.print(); } finally { window.close(); }
            }, 150);
          });
        <\/script>
      </body>
    </html>
  `),e.document.close())}function st(){var E,B,U;const n=d.value;if(!n)return;const e=N.value,i=C.value,p=Number(w.value.sub.toFixed(2)),$=Number(w.value.tax.toFixed(2)),S=Number(w.value.total.toFixed(2)),P=(n.items||[]).reduce((v,l)=>{const T=(Number(l.qty)||0)*(Number(l.unitPrice)||0),b=L(l);return v+Math.max(0,T-b)},0);function j(v){const l=["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],T=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];function b(c){return c<20?l[c]:c<100?T[Math.floor(c/10)]+(c%10?" "+l[c%10]:""):c<1e3?l[Math.floor(c/100)]+" hundred"+(c%100?" "+b(c%100):""):c<1e6?b(Math.floor(c/1e3))+" thousand"+(c%1e3?" "+b(c%1e3):""):c<1e9?b(Math.floor(c/1e6))+" million"+(c%1e6?" "+b(c%1e6):""):String(c)}const f=Math.floor(v),Q=Math.round((v-f)*100);let X=f===0?"zero":b(f);return Q&&(X+=` and ${Q}/100`),X.charAt(0).toUpperCase()+X.slice(1)}const m=j(S)+" only",k=(n.items||[]).map((v,l)=>{var c;const T=((c=x.products.find(ot=>ot.id===v.productId))==null?void 0:c.name)||v.description||"—",b=Number(v.qty||0),f=Number(v.unitPrice||0).toFixed(2),Q=Number(L(v)||0).toFixed(2),X=(v.discountType||"none")==="percent"?` · -${Number(v.discountValue||0).toFixed(0)}%`:(v.discountType||"none")==="fixed"?` · -${(Number(v.discountValue||0)*Number(v.qty||0)).toFixed(2)}`:"";return`
      <tr>
        <td class="sl">${String(l+1).padStart(2,"0")}</td>
        <td class="desc">
          <div class="nm">${T}</div>
          <div class="muted small">${b} x ${f}${X}</div>
        </td>
        <td class="amt">${Q}</td>
      </tr>
    `}).join(""),u=window.open("","_blank","noopener,noreferrer");if(!u)return;u.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Credit Note ${n.number||""}</title>
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
            <div class="title">${(e==null?void 0:e.name)||""}</div>
            ${(E=e==null?void 0:e.addresses)!=null&&E[0]?`<div class="small muted">${e.addresses[0].line1}, ${e.addresses[0].city}</div>`:""}
            ${e!=null&&e.taxId?`<div class="small muted">VAT/TAX: ${e.taxId}</div>`:""}
          </div>

          <hr />
          <div class="center title">CREDIT NOTE</div>
          <div class="line small" style="display:flex;justify-content:space-between;"><span>No:</span><span>${n.number||""}</span></div>
          <div class="line small" style="display:flex;justify-content:space-between;"><span>Date:</span><span>${n.date||""}</span></div>
          ${h.value?`<div class="line small" style="display:flex;justify-content:space-between;"><span>Ref Inv:</span><span>${h.value.number}</span></div>`:""}
          ${i!=null&&i.name?`<div class="line small" style="display:flex;justify-content:space-between;"><span>Customer:</span><span>${i.name}</span></div>`:""}
          ${n.reason?`<div class="small muted">Reason: ${n.reason}</div>`:""}

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
              ${k||'<tr><td colspan="3" class="small muted">No items</td></tr>'}
            </tbody>
          </table>

          <hr />

          <div class="totals">
            <div class="line"><span>Subtotal</span><span>${p.toFixed(2)}</span></div>
            ${P>0?`<div class="line"><span>Discount</span><span>-${P.toFixed(2)}</span></div>`:""}
            <div class="line"><span>VAT</span><span>${$.toFixed(2)}</span></div>
            <div class="line grand"><span>Total Credit</span><span>${S.toFixed(2)}</span></div>
          </div>

          <hr />

          <div class="small"><strong>In words:</strong> ${m}</div>

          <hr />

          ${(U=(B=x.settings)==null?void 0:B.creditNote)!=null&&U.footerText?`<div class="center small muted">${x.settings.creditNote.footerText}</div>`:""}
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
  `),u.document.close();try{u.focus()}catch(v){}const V=()=>setTimeout(()=>{try{u.focus(),u.print()}catch(v){}},300);u.document.readyState==="complete"?V():u.addEventListener("load",V)}function nt(){return W(this,null,function*(){var P,j;if(!(I!=null&&I.value)||!d.value)return;function n(){return W(this,null,function*(){return window.pdfMake||(yield new Promise((m,k)=>{const u=document.createElement("script");u.src="https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/pdfmake.min.js",u.onload=m,u.onerror=k,document.body.appendChild(u)}),yield new Promise((m,k)=>{const u=document.createElement("script");u.src="https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/vfs_fonts.min.js",u.onload=m,u.onerror=k,document.body.appendChild(u)})),window.pdfMake})}yield n();const e=d.value,i=N.value,p=C.value,$=[[{text:"Product / Description",bold:!0},{text:"Qty",alignment:"right",bold:!0},{text:"Unit",alignment:"right",bold:!0},{text:"Discount",alignment:"right",bold:!0},{text:"Line",alignment:"right",bold:!0}],...(e.items||[]).map(m=>{var k;return[((k=x.products.find(u=>u.id===m.productId))==null?void 0:k.name)||m.description||"—",{text:String(m.qty||0),alignment:"right"},{text:Number(m.unitPrice||0).toFixed(2),alignment:"right"},{text:(m.discountType||"none")==="percent"?"-"+Number(m.discountValue||0).toFixed(0)+"%":(m.discountType||"none")==="fixed"?"- "+(Number(m.discountValue||0)*Number(m.qty||0)).toFixed(2):"—",alignment:"right"},{text:L(m).toFixed(2),alignment:"right"}]})],S={pageSize:"A4",pageMargins:[28,28,28,28],content:[{columns:[[{text:(i==null?void 0:i.name)||"",bold:!0},{text:(P=i==null?void 0:i.addresses)!=null&&P.length?`${i.addresses[0].line1}, ${i.addresses[0].city}`:""},i!=null&&i.taxId?{text:`VAT/TAX ID: ${i.taxId}`,color:"#6c757d",fontSize:9}:{}],[{text:"Credit Note",style:"title",alignment:"right"},{text:`No: ${e.number}`,bold:!0,alignment:"right"},{text:`Date: ${e.date}`,alignment:"right"},h.value?{text:`Ref Invoice: ${h.value.number}`,alignment:"right"}:{}]]},{text:" ",margin:[0,6]},{text:"Bill To",bold:!0},{text:(p==null?void 0:p.name)||""},{text:(j=p==null?void 0:p.addresses)!=null&&j.length?`${p.addresses[0].line1}, ${p.addresses[0].city}`:""},e.reason?{text:`Reason: ${e.reason}`,margin:[0,6,0,0]}:{},{table:{headerRows:1,widths:["*",40,50,55,60],body:$},layout:"lightHorizontalLines",margin:[0,6,0,0]},{columns:[{text:" "},{width:180,alignment:"right",stack:[{text:`Subtotal: ${w.value.sub.toFixed(2)}`},{text:`Tax: ${w.value.tax.toFixed(2)}`},{text:`Total Credit: ${w.value.total.toFixed(2)}`,bold:!0}]}],margin:[0,8,0,0]}],footer:(m,k)=>{var u,V;return{margin:[28,8,28,16],fontSize:9,text:((V=(u=x.settings)==null?void 0:u.creditNote)==null?void 0:V.footerText)||""}},styles:{title:{fontSize:18,color:"#4a148c",bold:!0}},defaultStyle:{fontSize:10}};window.pdfMake.createPdf(S).download(`credit_note_${e.number||"view"}.pdf`)})}return(n,e)=>d.value?(a(),o("div",mt,[dt(ut,null,{title:O(()=>[t("div",vt,[t("span",null,"Credit Note "+s(d.value.number),1),d.value.status?(a(),o("span",{key:0,class:rt(["badge",`badge-${d.value.status}`])},s(d.value.status),3)):r("",!0)])]),actions:O(()=>[t("div",{class:"btn-group btn-group-sm"},[t("button",{class:"btn btn-outline-secondary",onClick:tt},"Edit"),t("button",{class:"btn btn-outline-secondary",onClick:et},"Print"),t("button",{class:"btn btn-outline-secondary",onClick:st},"Receipt"),t("button",{class:"btn btn-primary",onClick:nt},"Download PDF")])]),default:O(()=>{var i,p,$,S,P,j,m,k,u,V,E,B,U,v;return[t("div",pt,[e[4]||(e[4]=t("h3",{class:"detail-section-title"},"Credit Note Information",-1)),t("div",xt,[t("div",bt,[e[0]||(e[0]=t("div",{class:"detail-label"},"Credit Note Number",-1)),t("div",ft,s(d.value.number),1)]),t("div",_t,[e[1]||(e[1]=t("div",{class:"detail-label"},"Date",-1)),t("div",ht,s(d.value.date),1)]),h.value?(a(),o("div",yt,[e[2]||(e[2]=t("div",{class:"detail-label"},"Reference Invoice",-1)),t("div",gt,s(h.value.number),1)])):r("",!0),d.value.reason?(a(),o("div",wt,[e[3]||(e[3]=t("div",{class:"detail-label"},"Reason",-1)),t("div",kt,s(d.value.reason),1)])):r("",!0)])]),t("div",Nt,[e[11]||(e[11]=t("h3",{class:"detail-section-title"},"Parties",-1)),t("div",$t,[t("div",Tt,[e[7]||(e[7]=t("div",{class:"detail-label"},"From (Merchant)",-1)),t("div",It,[t("div",Ct,s((i=N.value)==null?void 0:i.name),1),D.value?(a(),o("div",Ft,[M(s(D.value.line1),1),e[5]||(e[5]=t("br",null,null,-1)),M(" "+s(D.value.city)+" "+s(D.value.zip),1)])):r("",!0),y.value?(a(),o("div",St,[M(s(y.value.name),1),e[6]||(e[6]=t("br",null,null,-1)),y.value.email?(a(),o("span",Pt,s(y.value.email),1)):r("",!0),y.value.phone?(a(),o("span",At," · "+s(y.value.phone),1)):r("",!0)])):r("",!0)])]),t("div",Dt,[e[10]||(e[10]=t("div",{class:"detail-label"},"To (Customer)",-1)),t("div",Vt,[t("div",Mt,s((p=C.value)==null?void 0:p.name),1),z.value?(a(),o("div",zt,[M(s(z.value.line1),1),e[8]||(e[8]=t("br",null,null,-1)),M(" "+s(z.value.city)+" "+s(z.value.zip),1)])):r("",!0),g.value?(a(),o("div",jt,[M(s(g.value.name),1),e[9]||(e[9]=t("br",null,null,-1)),g.value.email?(a(),o("span",Rt,s(g.value.email),1)):r("",!0),g.value.phone?(a(),o("span",qt," · "+s(g.value.phone),1)):r("",!0)])):r("",!0)])])])]),t("div",Lt,[e[14]||(e[14]=t("h3",{class:"detail-section-title"},"Line Items",-1)),t("div",Et,[t("table",Bt,[e[13]||(e[13]=t("thead",{class:"table-light"},[t("tr",null,[t("th",null,"Product / Description"),t("th",{class:"text-end"},"Qty"),t("th",{class:"text-end"},"Unit Price"),t("th",{class:"text-end"},"Discount"),t("th",{class:"text-end"},"Line Total")])],-1)),t("tbody",null,[(a(!0),o(Y,null,Z(d.value.items,l=>{var T,b;return a(),o("tr",{key:l.id},[t("td",null,[t("div",Ut,s(((T=A(x).products.find(f=>f.id===l.productId))==null?void 0:T.name)||l.description||"—"),1),l.description&&((b=A(x).products.find(f=>f.id===l.productId))==null?void 0:b.name)!==l.description?(a(),o("div",Xt,s(l.description),1)):r("",!0)]),t("td",Qt,s(l.qty),1),t("td",Ht,s(Number(l.unitPrice||0).toFixed(2)),1),t("td",Wt,[(l.discountType||"none")==="percent"?(a(),o("span",Ot,"-"+s(Number(l.discountValue||0).toFixed(0))+"%",1)):(l.discountType||"none")==="fixed"?(a(),o("span",Gt,"-"+s((Number(l.discountValue||0)*Number(l.qty||0)).toFixed(2)),1)):(a(),o("span",Jt,"—"))]),t("td",Kt,s(L(l).toFixed(2)),1)])}),128)),!d.value.items||!d.value.items.length?(a(),o("tr",Yt,[...e[12]||(e[12]=[t("td",{colspan:"5",class:"text-center text-muted"},"No items",-1)])])):r("",!0)])])])]),t("div",Zt,[e[18]||(e[18]=t("h3",{class:"detail-section-title"},"Totals",-1)),t("div",te,[t("div",ee,[t("div",se,[e[15]||(e[15]=t("span",{class:"totals-label"},"Subtotal",-1)),t("span",ne,s(w.value.sub.toFixed(2)),1)]),t("div",oe,[e[16]||(e[16]=t("span",{class:"totals-label"},"Tax",-1)),t("span",ae,s(w.value.tax.toFixed(2)),1)]),t("div",ie,[e[17]||(e[17]=t("span",{class:"totals-label"},"Total Credit",-1)),t("span",le,s(w.value.total.toFixed(2)),1)])])])]),d.value.notes||(S=($=A(x).settings)==null?void 0:$.creditNote)!=null&&S.footerText?(a(),o("div",de,[e[21]||(e[21]=t("h3",{class:"detail-section-title"},"Additional Information",-1)),(j=(P=A(x).settings)==null?void 0:P.creditNote)!=null&&j.footerText?(a(),o("div",re,[e[19]||(e[19]=t("div",{class:"detail-label mb-2"},"Footer Text",-1)),t("div",ue,s(A(x).settings.creditNote.footerText),1)])):r("",!0),d.value.notes?(a(),o("div",ce,[e[20]||(e[20]=t("div",{class:"detail-label mb-2"},"Notes",-1)),t("div",me,s(d.value.notes),1)])):r("",!0)])):r("",!0),t("div",{class:"print-area",ref_key:"printRef",ref:I},[t("div",ve,[t("div",null,[t("strong",null,s((m=N.value)==null?void 0:m.name),1),e[22]||(e[22]=t("br",null,null,-1)),D.value?(a(),o("span",pe,s(D.value.line1)+", "+s(D.value.city),1)):r("",!0),D.value?(a(),o("br",xe)):r("",!0),(k=N.value)!=null&&k.taxId?(a(),o("span",be,"VAT/TAX ID: "+s(N.value.taxId),1)):r("",!0),(u=N.value)!=null&&u.taxId?(a(),o("br",fe)):r("",!0),y.value?(a(),o("span",_e,[M(s(y.value.name),1),y.value.email?(a(),o("span",he," · "+s(y.value.email),1)):r("",!0),y.value.phone?(a(),o("span",ye," · "+s(y.value.phone),1)):r("",!0)])):r("",!0)]),t("div",ge,[e[23]||(e[23]=t("h4",{class:"mb-1"},"Credit Note",-1)),t("div",null,[t("strong",null,"No: "+s(d.value.number),1)]),t("div",null,"Date: "+s(d.value.date),1),h.value?(a(),o("div",we,"Ref Invoice: "+s((V=h.value)==null?void 0:V.number),1)):r("",!0)])]),t("div",ke,[e[24]||(e[24]=t("div",{class:"text-uppercase muted-label"},"Bill To",-1)),t("div",Ne,s((E=C.value)==null?void 0:E.name),1),z.value?(a(),o("div",$e,s(z.value.line1)+", "+s(z.value.city),1)):r("",!0),(B=C.value)!=null&&B.taxId?(a(),o("div",Te,"VAT/TAX ID: "+s(C.value.taxId),1)):r("",!0),d.value.reason?(a(),o("div",Ie,"Reason: "+s(d.value.reason),1)):r("",!0),g.value?(a(),o("div",Ce,[M(s(g.value.name),1),g.value.email?(a(),o("span",Fe," · "+s(g.value.email),1)):r("",!0),g.value.phone?(a(),o("span",Se," · "+s(g.value.phone),1)):r("",!0)])):r("",!0)]),t("table",Pe,[e[25]||(e[25]=t("thead",{class:"table-light"},[t("tr",null,[t("th",null,"Product / Description"),t("th",{class:"text-end"},"Qty"),t("th",{class:"text-end"},"Unit"),t("th",{class:"text-end"},"Discount"),t("th",{class:"text-end"},"Line")])],-1)),t("tbody",null,[(a(!0),o(Y,null,Z(d.value.items,l=>{var T,b;return a(),o("tr",{key:l.id},[t("td",null,[t("div",Ae,s(((T=A(x).products.find(f=>f.id===l.productId))==null?void 0:T.name)||l.description||"—"),1),l.description&&((b=A(x).products.find(f=>f.id===l.productId))==null?void 0:b.name)!==l.description?(a(),o("div",De,s(l.description),1)):r("",!0)]),t("td",Ve,s(l.qty),1),t("td",Me,s(Number(l.unitPrice||0).toFixed(2)),1),t("td",ze,[(l.discountType||"none")==="percent"?(a(),o("span",je,"-"+s(Number(l.discountValue||0).toFixed(0))+"%",1)):(l.discountType||"none")==="fixed"?(a(),o("span",Re,"-"+s((Number(l.discountValue||0)*Number(l.qty||0)).toFixed(2)),1)):(a(),o("span",qe,"—"))]),t("td",Le,s(L(l).toFixed(2)),1)])}),128))])]),t("div",Ee,[e[29]||(e[29]=t("div",{class:"flex-grow-1"},null,-1)),t("div",Be,[t("div",Ue,[e[26]||(e[26]=t("span",null,"Subtotal",-1)),t("span",null,s(w.value.sub.toFixed(2)),1)]),t("div",Xe,[e[27]||(e[27]=t("span",null,"Tax",-1)),t("span",null,s(w.value.tax.toFixed(2)),1)]),t("div",Qe,[e[28]||(e[28]=t("span",null,"Total Credit",-1)),t("span",null,s(w.value.total.toFixed(2)),1)])])]),(v=(U=A(x).settings)==null?void 0:U.creditNote)!=null&&v.footerText?(a(),o("div",He,[t("div",We,s(A(x).settings.creditNote.footerText),1)])):r("",!0),d.value.notes?(a(),o("div",Oe,[e[30]||(e[30]=t("strong",null,"Notes",-1)),t("div",Ge,s(d.value.notes),1)])):r("",!0)],512)]}),_:1})])):(a(),o("div",Je,"Credit Note not found."))}},ss=ct(Ke,[["__scopeId","data-v-9702eebf"]]);export{ss as default};
