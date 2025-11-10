var H=(Q,X,S)=>new Promise((h,i)=>{var y=_=>{try{g(S.next(_))}catch(A){i(A)}},k=_=>{try{g(S.throw(_))}catch(A){i(A)}},g=_=>_.done?h(_.value):Promise.resolve(_.value).then(y,k);g((S=S.apply(Q,X)).next())});import{s as nt,b as f,u as ot,e as d,o as l,f as s,p as at,k as J,v as it,i as p,t as a,B as K,F as dt,h as lt,l as B}from"./vendor-CDgTUOzk.js";import{S as rt}from"./SectionCard-Emg7MEbk.js";import{s as v}from"./index-DuACpEyu.js";const ct={key:0,class:"row g-3"},ut={class:"col-12"},mt={class:"d-flex justify-content-between mb-3"},pt={key:0},vt={key:1},ft={key:2,class:"text-muted small"},xt={key:3},bt={key:4,class:"text-muted small"},ht={key:0},yt={key:1},gt={class:"text-end"},_t={key:0},wt={class:"mb-2 info-block"},Nt={class:"fw-semibold"},$t={key:0},kt={key:1,class:"text-muted small"},Tt={key:2,class:"text-muted small"},It={key:3,class:"text-muted small"},Ct={key:0},Ft={key:1},St={class:"table table-sm table-invoice align-middle mt-2"},At={class:"fw-medium"},Dt={key:0,class:"text-muted small"},Mt={class:"text-end"},Pt={class:"text-end"},Vt={class:"text-end"},jt={key:0},zt={key:1},Rt={key:2},qt={class:"text-end"},Lt={class:"mt-2 d-flex"},Et={class:"totals-card"},Bt={class:"line"},Xt={class:"line"},Ut={class:"line grand"},Ht={key:0,class:"mt-3 invoice-terms"},Qt={class:"text-muted"},Wt={key:1,class:"mt-2"},Ot={style:{"white-space":"pre-wrap"}},Gt={key:1,class:"text-muted"},te={__name:"CreditNoteView",setup(Q){const X=ot(),S=it(),h=nt(null),i=f(()=>(v.creditNotes||[]).find(e=>e.id===X.params.id)),y=f(()=>v.merchants.find(e=>{var t;return e.id===((t=i.value)==null?void 0:t.merchantId)})),k=f(()=>v.customers.find(e=>{var t;return e.id===((t=i.value)==null?void 0:t.customerId)})),g=f(()=>v.invoices.find(e=>{var t;return e.id===((t=i.value)==null?void 0:t.originalInvoiceId)})),_=f(()=>{var e;return((e=y.value)==null?void 0:e.addresses)||[]}),A=f(()=>{var e;return((e=y.value)==null?void 0:e.contacts)||[]}),L=f(()=>{var e;return _.value.find(t=>{var n;return t.id===((n=i.value)==null?void 0:n.merchantAddressId)})||((e=_.value)==null?void 0:e[0])}),D=f(()=>{var e;return A.value.find(t=>{var n;return t.id===((n=i.value)==null?void 0:n.merchantContactId)})||((e=A.value)==null?void 0:e[0])}),W=f(()=>{var e;return((e=k.value)==null?void 0:e.addresses)||[]}),O=f(()=>{var e;return((e=k.value)==null?void 0:e.contacts)||[]}),U=f(()=>{var e;return W.value.find(t=>{var n;return t.id===((n=i.value)==null?void 0:n.customerAddressId)})||((e=W.value)==null?void 0:e[0])}),M=f(()=>{var e;return O.value.find(t=>{var n;return t.id===((n=i.value)==null?void 0:n.customerContactId)})||((e=O.value)==null?void 0:e[0])});function V(e){const t=(Number(e.qty)||0)*(Number(e.unitPrice)||0),n=e.discountType||"none",u=Number(e.discountValue)||0,b=n==="percent"?t*u/100:n==="fixed"?(Number(e.qty)||0)*u:0;return Math.max(0,t-b)}const T=f(()=>{const e=i.value;if(!e)return{sub:0,tax:0,total:0};let t=0,n=0;for(const u of e.items||[]){const b=V(u);t+=b;const w=v.taxes.find(N=>N.id===u.taxId);w&&(n+=b*(Number(w.rate)||0)/100)}return{sub:t,tax:n,total:t+n}});function Y(){i.value&&S.push(`/credit-notes/${i.value.id}/edit`)}function Z(){var n;if(!(h!=null&&h.value))return;const e=h.value.outerHTML,t=window.open("","_blank","noopener,noreferrer");t&&(t.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>${((n=i.value)==null?void 0:n.number)||"Credit Note"}</title>
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
        ${e}
        <script>
          window.addEventListener('load', function(){
            setTimeout(function(){
              try { window.focus(); window.print(); } finally { window.close(); }
            }, 150);
          });
        <\/script>
      </body>
    </html>
  `),t.document.close())}function tt(){var j,P,G;const e=i.value;if(!e)return;const t=y.value,n=k.value,u=Number(T.value.sub.toFixed(2)),b=Number(T.value.tax.toFixed(2)),w=Number(T.value.total.toFixed(2)),N=(e.items||[]).reduce((m,I)=>{const z=(Number(I.qty)||0)*(Number(I.unitPrice)||0),$=V(I);return m+Math.max(0,z-$)},0);function F(m){const I=["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],z=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];function $(r){return r<20?I[r]:r<100?z[Math.floor(r/10)]+(r%10?" "+I[r%10]:""):r<1e3?I[Math.floor(r/100)]+" hundred"+(r%100?" "+$(r%100):""):r<1e6?$(Math.floor(r/1e3))+" thousand"+(r%1e3?" "+$(r%1e3):""):r<1e9?$(Math.floor(r/1e6))+" million"+(r%1e6?" "+$(r%1e6):""):String(r)}const R=Math.floor(m),E=Math.round((m-R)*100);let q=R===0?"zero":$(R);return E&&(q+=` and ${E}/100`),q.charAt(0).toUpperCase()+q.slice(1)}const c=F(w)+" only",x=(e.items||[]).map((m,I)=>{var r;const z=((r=v.products.find(st=>st.id===m.productId))==null?void 0:r.name)||m.description||"—",$=Number(m.qty||0),R=Number(m.unitPrice||0).toFixed(2),E=Number(V(m)||0).toFixed(2),q=(m.discountType||"none")==="percent"?` · -${Number(m.discountValue||0).toFixed(0)}%`:(m.discountType||"none")==="fixed"?` · -${(Number(m.discountValue||0)*Number(m.qty||0)).toFixed(2)}`:"";return`
      <tr>
        <td class="sl">${String(I+1).padStart(2,"0")}</td>
        <td class="desc">
          <div class="nm">${z}</div>
          <div class="muted small">${$} x ${R}${q}</div>
        </td>
        <td class="amt">${E}</td>
      </tr>
    `}).join(""),o=window.open("","_blank","noopener,noreferrer");if(!o)return;o.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Credit Note ${e.number||""}</title>
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
            <div class="title">${(t==null?void 0:t.name)||""}</div>
            ${(j=t==null?void 0:t.addresses)!=null&&j[0]?`<div class="small muted">${t.addresses[0].line1}, ${t.addresses[0].city}</div>`:""}
            ${t!=null&&t.taxId?`<div class="small muted">VAT/TAX: ${t.taxId}</div>`:""}
          </div>

          <hr />
          <div class="center title">CREDIT NOTE</div>
          <div class="line small" style="display:flex;justify-content:space-between;"><span>No:</span><span>${e.number||""}</span></div>
          <div class="line small" style="display:flex;justify-content:space-between;"><span>Date:</span><span>${e.date||""}</span></div>
          ${g.value?`<div class="line small" style="display:flex;justify-content:space-between;"><span>Ref Inv:</span><span>${g.value.number}</span></div>`:""}
          ${n!=null&&n.name?`<div class="line small" style="display:flex;justify-content:space-between;"><span>Customer:</span><span>${n.name}</span></div>`:""}
          ${e.reason?`<div class="small muted">Reason: ${e.reason}</div>`:""}

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
              ${x||'<tr><td colspan="3" class="small muted">No items</td></tr>'}
            </tbody>
          </table>

          <hr />

          <div class="totals">
            <div class="line"><span>Subtotal</span><span>${u.toFixed(2)}</span></div>
            ${N>0?`<div class="line"><span>Discount</span><span>-${N.toFixed(2)}</span></div>`:""}
            <div class="line"><span>VAT</span><span>${b.toFixed(2)}</span></div>
            <div class="line grand"><span>Total Credit</span><span>${w.toFixed(2)}</span></div>
          </div>

          <hr />

          <div class="small"><strong>In words:</strong> ${c}</div>

          <hr />

          ${(G=(P=v.settings)==null?void 0:P.creditNote)!=null&&G.footerText?`<div class="center small muted">${v.settings.creditNote.footerText}</div>`:""}
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
  `),o.document.close();try{o.focus()}catch(m){}const C=()=>setTimeout(()=>{try{o.focus(),o.print()}catch(m){}},300);o.document.readyState==="complete"?C():o.addEventListener("load",C)}function et(){return H(this,null,function*(){var N,F;if(!(h!=null&&h.value)||!i.value)return;function e(){return H(this,null,function*(){return window.pdfMake||(yield new Promise((c,x)=>{const o=document.createElement("script");o.src="https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/pdfmake.min.js",o.onload=c,o.onerror=x,document.body.appendChild(o)}),yield new Promise((c,x)=>{const o=document.createElement("script");o.src="https://cdn.jsdelivr.net/npm/pdfmake@0.2.10/build/vfs_fonts.min.js",o.onload=c,o.onerror=x,document.body.appendChild(o)})),window.pdfMake})}yield e();const t=i.value,n=y.value,u=k.value,b=[[{text:"Product / Description",bold:!0},{text:"Qty",alignment:"right",bold:!0},{text:"Unit",alignment:"right",bold:!0},{text:"Discount",alignment:"right",bold:!0},{text:"Line",alignment:"right",bold:!0}],...(t.items||[]).map(c=>{var x;return[((x=v.products.find(o=>o.id===c.productId))==null?void 0:x.name)||c.description||"—",{text:String(c.qty||0),alignment:"right"},{text:Number(c.unitPrice||0).toFixed(2),alignment:"right"},{text:(c.discountType||"none")==="percent"?"-"+Number(c.discountValue||0).toFixed(0)+"%":(c.discountType||"none")==="fixed"?"- "+(Number(c.discountValue||0)*Number(c.qty||0)).toFixed(2):"—",alignment:"right"},{text:V(c).toFixed(2),alignment:"right"}]})],w={pageSize:"A4",pageMargins:[28,28,28,28],content:[{columns:[[{text:(n==null?void 0:n.name)||"",bold:!0},{text:(N=n==null?void 0:n.addresses)!=null&&N.length?`${n.addresses[0].line1}, ${n.addresses[0].city}`:""},n!=null&&n.taxId?{text:`VAT/TAX ID: ${n.taxId}`,color:"#6c757d",fontSize:9}:{}],[{text:"Credit Note",style:"title",alignment:"right"},{text:`No: ${t.number}`,bold:!0,alignment:"right"},{text:`Date: ${t.date}`,alignment:"right"},g.value?{text:`Ref Invoice: ${g.value.number}`,alignment:"right"}:{}]]},{text:" ",margin:[0,6]},{text:"Bill To",bold:!0},{text:(u==null?void 0:u.name)||""},{text:(F=u==null?void 0:u.addresses)!=null&&F.length?`${u.addresses[0].line1}, ${u.addresses[0].city}`:""},t.reason?{text:`Reason: ${t.reason}`,margin:[0,6,0,0]}:{},{table:{headerRows:1,widths:["*",40,50,55,60],body:b},layout:"lightHorizontalLines",margin:[0,6,0,0]},{columns:[{text:" "},{width:180,alignment:"right",stack:[{text:`Subtotal: ${T.value.sub.toFixed(2)}`},{text:`Tax: ${T.value.tax.toFixed(2)}`},{text:`Total Credit: ${T.value.total.toFixed(2)}`,bold:!0}]}],margin:[0,8,0,0]}],footer:(c,x)=>{var o,C;return{margin:[28,8,28,16],fontSize:9,text:((C=(o=v.settings)==null?void 0:o.creditNote)==null?void 0:C.footerText)||""}},styles:{title:{fontSize:18,color:"#4a148c",bold:!0}},defaultStyle:{fontSize:10}};window.pdfMake.createPdf(w).download(`credit_note_${t.number||"view"}.pdf`)})}return(e,t)=>i.value?(l(),d("div",ct,[s("div",ut,[at(rt,{title:`Credit Note ${i.value.number}`},{actions:J(()=>[s("div",{class:"btn-group btn-group-sm"},[s("button",{class:"btn btn-outline-secondary",onClick:Y},"Edit"),s("button",{class:"btn btn-outline-secondary",onClick:Z},"Print"),s("button",{class:"btn btn-outline-secondary",onClick:tt},"Receipt"),s("button",{class:"btn btn-primary",onClick:et},"Download PDF")])]),default:J(()=>{var n,u,b,w,N,F,c,x;return[s("div",{class:"print-area",ref_key:"printRef",ref:h},[s("div",mt,[s("div",null,[s("strong",null,a((n=y.value)==null?void 0:n.name),1),t[0]||(t[0]=s("br",null,null,-1)),L.value?(l(),d("span",pt,a(L.value.line1)+", "+a(L.value.city),1)):p("",!0),L.value?(l(),d("br",vt)):p("",!0),(u=y.value)!=null&&u.taxId?(l(),d("span",ft,"VAT/TAX ID: "+a(y.value.taxId),1)):p("",!0),(b=y.value)!=null&&b.taxId?(l(),d("br",xt)):p("",!0),D.value?(l(),d("span",bt,[K(a(D.value.name),1),D.value.email?(l(),d("span",ht," · "+a(D.value.email),1)):p("",!0),D.value.phone?(l(),d("span",yt," · "+a(D.value.phone),1)):p("",!0)])):p("",!0)]),s("div",gt,[t[1]||(t[1]=s("h4",{class:"mb-1"},"Credit Note",-1)),s("div",null,[s("strong",null,"No: "+a(i.value.number),1)]),s("div",null,"Date: "+a(i.value.date),1),g.value?(l(),d("div",_t,"Ref Invoice: "+a((w=g.value)==null?void 0:w.number),1)):p("",!0)])]),s("div",wt,[t[2]||(t[2]=s("div",{class:"text-uppercase muted-label"},"Bill To",-1)),s("div",Nt,a((N=k.value)==null?void 0:N.name),1),U.value?(l(),d("div",$t,a(U.value.line1)+", "+a(U.value.city),1)):p("",!0),(F=k.value)!=null&&F.taxId?(l(),d("div",kt,"VAT/TAX ID: "+a(k.value.taxId),1)):p("",!0),i.value.reason?(l(),d("div",Tt,"Reason: "+a(i.value.reason),1)):p("",!0),M.value?(l(),d("div",It,[K(a(M.value.name),1),M.value.email?(l(),d("span",Ct," · "+a(M.value.email),1)):p("",!0),M.value.phone?(l(),d("span",Ft," · "+a(M.value.phone),1)):p("",!0)])):p("",!0)]),s("table",St,[t[3]||(t[3]=s("thead",{class:"table-light"},[s("tr",null,[s("th",null,"Product / Description"),s("th",{class:"text-end"},"Qty"),s("th",{class:"text-end"},"Unit"),s("th",{class:"text-end"},"Discount"),s("th",{class:"text-end"},"Line")])],-1)),s("tbody",null,[(l(!0),d(dt,null,lt(i.value.items,o=>{var C,j;return l(),d("tr",{key:o.id},[s("td",null,[s("div",At,a(((C=B(v).products.find(P=>P.id===o.productId))==null?void 0:C.name)||o.description||"—"),1),o.description&&((j=B(v).products.find(P=>P.id===o.productId))==null?void 0:j.name)!==o.description?(l(),d("div",Dt,a(o.description),1)):p("",!0)]),s("td",Mt,a(o.qty),1),s("td",Pt,a(Number(o.unitPrice||0).toFixed(2)),1),s("td",Vt,[(o.discountType||"none")==="percent"?(l(),d("span",jt,"-"+a(Number(o.discountValue||0).toFixed(0))+"%",1)):(o.discountType||"none")==="fixed"?(l(),d("span",zt,"-"+a((Number(o.discountValue||0)*Number(o.qty||0)).toFixed(2)),1)):(l(),d("span",Rt,"—"))]),s("td",qt,a(V(o).toFixed(2)),1)])}),128))])]),s("div",Lt,[t[7]||(t[7]=s("div",{class:"flex-grow-1"},null,-1)),s("div",Et,[s("div",Bt,[t[4]||(t[4]=s("span",null,"Subtotal",-1)),s("span",null,a(T.value.sub.toFixed(2)),1)]),s("div",Xt,[t[5]||(t[5]=s("span",null,"Tax",-1)),s("span",null,a(T.value.tax.toFixed(2)),1)]),s("div",Ut,[t[6]||(t[6]=s("span",null,"Total Credit",-1)),s("span",null,a(T.value.total.toFixed(2)),1)])])]),(x=(c=B(v).settings)==null?void 0:c.creditNote)!=null&&x.footerText?(l(),d("div",Ht,[s("div",Qt,a(B(v).settings.creditNote.footerText),1)])):p("",!0),i.value.notes?(l(),d("div",Wt,[t[8]||(t[8]=s("strong",null,"Notes",-1)),s("div",Ot,a(i.value.notes),1)])):p("",!0)],512)]}),_:1},8,["title"])])])):(l(),d("div",Gt,"Credit Note not found."))}};export{te as default};
