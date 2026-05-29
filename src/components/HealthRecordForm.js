"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthRecordForm = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const useAuth_1 = require("../hooks/useAuth");
const HealthRecordForm = ({ type }) => {
    const { userId, token } = (0, useAuth_1.useAuth)(); // returns { userId: string, token: string }
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [success, setSuccess] = (0, react_1.useState)(false);
    // ---------- Estado do formulário ----------
    const [bp, setBP] = (0, react_1.useState)({
        systolic: 0,
        diastolic: 0,
        pulse: undefined,
        note: '',
    });
    const [glucose, setGlucose] = (0, react_1.useState)({
        valueMgDl: 0,
        context: 'FASTING',
        note: '',
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        try {
            let res;
            if (type === 'bloodPressure') {
                res = await fetch('/api/health/blood-pressure', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ patientId: userId, ...bp }),
                });
            }
            else {
                res = await fetch('/api/health/glucose', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ patientId: userId, ...glucose }),
                });
            }
            if (!res.ok)
                throw new Error(`Erro ${res.status}`);
            const data = await res.json();
            setSuccess(true);
            // optional: reset form
            if (type === 'bloodPressure') {
                setBP({ systolic: 0, diastolic: 0, pulse: undefined, note: '' });
            }
            else {
                setGlucose({ valueMgDl: 0, context: 'FASTING', note: '' });
            }
        }
        catch (err) {
            setError(err.message ?? 'Erro desconhecido');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-md mx-auto p-6 bg-white rounded-lg shadow-md", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-semibold mb-4", children: type === 'bloodPressure' ? 'Registro de Pressão Arterial' : 'Registro de Glicemia' }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-4", children: [type === 'bloodPressure' ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Sist\u00F3lica (mmHg)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", className: "w-full px-3 py-2 border rounded", value: bp.systolic, onChange: (e) => setBP({ ...bp, systolic: Number(e.target.value) || 0 }), required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Diast\u00F3lica (mmHg)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", className: "w-full px-3 py-2 border rounded", value: bp.diastolic, onChange: (e) => setBP({ ...bp, diastolic: Number(e.target.value) || 0 }), required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Pulsa\u00E7\u00E3o (bpm) \u2013 opcional" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", className: "w-full px-3 py-2 border rounded", value: bp.pulse ?? '', onChange: (e) => setBP({
                                            ...bp,
                                            pulse: e.target.value ? Number(e.target.value) : undefined,
                                        }) })] })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Valor (mg/dL)" }), (0, jsx_runtime_1.jsx)("input", { type: "number", step: "0.1", min: "0", className: "w-full px-3 py-2 border rounded", value: glucose.valueMgDl, onChange: (e) => setGlucose({
                                            ...glucose,
                                            valueMgDl: Number(e.target.value) || 0,
                                        }), required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Contexto" }), (0, jsx_runtime_1.jsxs)("select", { className: "w-full px-3 py-2 border rounded", value: glucose.context, onChange: (e) => setGlucose({ ...glucose, context: e.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "FASTING", children: "Jejum" }), (0, jsx_runtime_1.jsx)("option", { value: "PRE_MEAL", children: "Pr\u00E9\u2011refei\u00E7\u00E3o" }), (0, jsx_runtime_1.jsx)("option", { value: "POST_MEAL", children: "P\u00F3s\u2011refei\u00E7\u00E3o" }), (0, jsx_runtime_1.jsx)("option", { value: "RANDOM", children: "Aleat\u00F3rio" })] })] })] })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Observa\u00E7\u00E3o (opcional)" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 2, className: "w-full px-3 py-2 border rounded", value: type === 'bloodPressure' ? bp.note : glucose.note, onChange: (e) => {
                                    if (type === 'bloodPressure')
                                        setBP({ ...bp, note: e.target.value });
                                    else
                                        setGlucose({ ...glucose, note: e.target.value });
                                } })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50", children: loading ? 'Salvando...' : 'Salvar registro' })] }), error && (0, jsx_runtime_1.jsx)("p", { className: "text-red-600 mt-2", children: error }), success && (0, jsx_runtime_1.jsx)("p", { className: "text-green-600 mt-2", children: "Registro salvo com sucesso!" })] }));
};
exports.HealthRecordForm = HealthRecordForm;
//# sourceMappingURL=HealthRecordForm.js.map