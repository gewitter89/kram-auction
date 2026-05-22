import Link from "next/link";

export default function LegacyAuctionPage() {
  return (
    <main className="min-h-screen bg-[#05060a] text-white flex items-center justify-center px-6 py-24">
      <section className="max-w-2xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 md:p-10 shadow-2xl text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-400 font-black mb-4">KRAM.UA free beta</p>
        <h1 className="text-3xl md:text-5xl font-black font-display mb-4">Сторінку live-аукціону оновлено</h1>
        <p className="text-slate-300 leading-relaxed mb-8">
          Ми прибрали демо-торги, ботів і фейкову активність. На KRAM показуються тільки реальні оголошення та ставки користувачів. Платформа безкоштовна і не обробляє платежі.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/catalog" className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-black text-white hover:bg-emerald-400 transition-colors">Перейти в каталог</Link>
          <Link href="/sell" className="rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold text-slate-200 hover:bg-white/5 transition-colors">Створити реальний лот</Link>
        </div>
      </section>
    </main>
  );
}
