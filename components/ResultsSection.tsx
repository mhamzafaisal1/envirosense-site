"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import metrics from "@/lib/metrics.json";
import { cap } from "@/lib/api";
import { GITHUB } from "@/lib/config";

const rf = metrics.models.random_forest;
const lr = metrics.models.logistic_regression;
const pct = (v: number) => Math.round(v * 1000) / 10;

const summary = [
  { metric: "5-fold CV accuracy", rf: pct(rf.cv_accuracy_mean), lr: pct(lr.cv_accuracy_mean) },
  { metric: "Hold-out accuracy", rf: pct(rf.test_accuracy), lr: pct(lr.test_accuracy) },
  { metric: "Hold-out macro F1", rf: pct(rf.test_macro_f1), lr: pct(lr.test_macro_f1) },
];

const LABELS: Record<string, string> = { N: "Nitrogen", P: "Phosphorus", K: "Potassium", temperature: "Temperature", humidity: "Humidity", ph: "Soil pH", rainfall: "Rainfall" };
const importance = metrics.permutation_importance.map(r => ({ name: LABELS[r.feature] ?? r.feature, value: Math.round(r.importance * 1000) / 10 }));

// Crops where the linear baseline struggles most. That's where the forest earns its keep.
const perClass = Object.keys(lr.per_class_f1)
  .map(c => ({ crop: cap(c), rf: pct((rf.per_class_f1 as Record<string, number>)[c]), lr: pct((lr.per_class_f1 as Record<string, number>)[c]) }))
  .sort((a, b) => a.lr - b.lr)
  .slice(0, 6);

const tip = { contentStyle: { background: "#111c14", border: "1px solid #1f3323", borderRadius: 8 }, labelStyle: { color: "#f0faf3" } };

export default function ResultsSection() {
  return (
    <section id="results" className="section-shell">
      <div className="section-inner">
        <p className="section-label">Results</p>
        <h2 className="section-title mt-4">Evaluated on data the model never saw.</h2>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-textMuted">
          {metrics.dataset.rows.toLocaleString()} real soil and climate samples across {metrics.dataset.classes} crops. {metrics.dataset.split}.
          These numbers are read straight from the training script&apos;s output. Re-run it and you get the same ones.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [`${pct(rf.test_accuracy)}%`, "Random Forest hold-out accuracy"],
            [`${pct(lr.test_accuracy)}%`, "Logistic regression baseline"],
            [`±${pct(rf.cv_accuracy_std)}%`, "Std. dev. across 5 CV folds"],
          ].map(([v, l]) => (
            <div key={l} className="card p-7">
              <p className="font-mono text-5xl text-accent">{v}</p>
              <p className="mt-2 text-textMuted">{l}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-4 font-semibold">Random Forest vs. baseline</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary}>
                  <CartesianGrid stroke="#1f3323" vertical={false} />
                  <XAxis dataKey="metric" stroke="#9ab8a0" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ab8a0" domain={[90, 100]} unit="%" />
                  <Tooltip {...tip} formatter={(v: number) => `${v}%`} />
                  <Legend />
                  <Bar dataKey="rf" name="Random Forest" fill="#4ade80" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lr" name="Logistic Regression" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-textMuted">Y-axis starts at 90% so the gap is visible.</p>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-semibold">Where the baseline struggles (F1 by crop, worst 6)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perClass} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="#1f3323" horizontal={false} />
                  <XAxis type="number" stroke="#9ab8a0" domain={[80, 100]} unit="%" />
                  <YAxis dataKey="crop" type="category" stroke="#9ab8a0" width={90} tick={{ fontSize: 12 }} />
                  <Tooltip {...tip} formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="rf" name="Random Forest" fill="#4ade80" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="lr" name="Logistic Regression" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-textMuted">Crops that grow in near-identical conditions (rice vs. jute, lentil vs. moth beans) are where a linear boundary breaks down.</p>
          </div>
        </div>

        <div className="mt-6 card p-5">
          <h3 className="mb-1 font-semibold">What the model actually relies on</h3>
          <p className="mb-4 text-sm text-textMuted">Permutation importance: the drop in hold-out accuracy when each feature is shuffled.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={importance} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid stroke="#1f3323" horizontal={false} />
                <XAxis type="number" stroke="#9ab8a0" unit=" pts" />
                <YAxis dataKey="name" type="category" stroke="#9ab8a0" width={100} />
                <Tooltip {...tip} formatter={(v: number) => `${v} accuracy points`} />
                <Bar dataKey="value" name="Accuracy drop" fill="#4ade80" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-3 text-sm leading-6 text-textMuted">
            Humidity, nitrogen, rainfall and potassium carry the prediction. Temperature and pH barely matter here, because they vary little between crops in this dataset.
          </p>
        </div>

        <p className="mt-6 font-mono text-xs text-textMuted">
          scikit-learn {metrics.versions.scikit_learn} · trained {metrics.trained_at.slice(0, 10)} ·{" "}
          <a href={GITHUB.ml} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">training code →</a>
        </p>
      </div>
    </section>
  );
}
