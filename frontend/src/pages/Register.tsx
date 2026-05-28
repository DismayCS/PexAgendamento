import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ChangeEvent, FormEvent } from "react";
import PageHeader from "@/components/PageHeader";
import Alert from "@/components/Alert";
import { registerUser } from "@/api/auth";
import { useSettings } from "@/contexts/SettingsContext";
import { getDictionary } from "@/i18n";

type FeedbackState = { type: "success" | "error"; message: string } | null;

const RegisterPage = () => {
  const [formState, setFormState] = useState({
    nome_completo: "",
    usuario: "",
    email: "",
    senha: "",
    confirmar_senha: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const { settings } = useSettings();
  const navigate = useNavigate();
  const dict = getDictionary(settings.language).pages.register;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!formState.nome_completo || !formState.usuario || !formState.senha) {
      setFeedback({ type: "error", message: dict.description });
      return;
    }

    if (formState.senha !== formState.confirmar_senha) {
      setFeedback({ type: "error", message: dict.confirmPassword });
      return;
    }

    setSubmitting(true);
    try {
      const response = await registerUser(formState);
      setFeedback({ type: "success", message: response.message });
      setFormState({ nome_completo: "", usuario: "", email: "", senha: "", confirmar_senha: "" });
      navigate("/login", { replace: true });
    } catch (error) {
      setFeedback({ type: "error", message: (error as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <PageHeader title={dict.title} description={dict.description} />

        {feedback && <Alert type={feedback.type} message={feedback.message} />}

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nome_completo">{dict.name}</label>
            <input
              id="nome_completo"
              name="nome_completo"
              value={formState.nome_completo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="usuario">{dict.username}</label>
            <input
              id="usuario"
              name="usuario"
              value={formState.usuario}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{dict.email}</label>
            <input id="email" name="email" type="email" value={formState.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="senha">{dict.password}</label>
            <input
              id="senha"
              name="senha"
              type="password"
              value={formState.senha}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmar_senha">{dict.confirmPassword}</label>
            <input
              id="confirmar_senha"
              name="confirmar_senha"
              type="password"
              value={formState.confirmar_senha}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? dict.loading : dict.submit}
          </button>
        </form>

        <p style={{ marginTop: "16px" }}>
          {dict.signinPrompt} <Link to="/login">{dict.signinLink}</Link>.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
