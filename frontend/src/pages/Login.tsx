import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { FormEvent, ChangeEvent } from "react";
import PageHeader from "@/components/PageHeader";
import Alert from "@/components/Alert";
import { loginUser } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { getDictionary } from "@/i18n";

type FeedbackState = { type: "success" | "error"; message: string } | null;

const LoginPage = () => {
  const [formState, setFormState] = useState({ identificador: "", senha: "" });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const dict = getDictionary(settings.language).pages.login;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!formState.identificador || !formState.senha) {
      setFeedback({ type: "error", message: dict.identifier });
      return;
    }

    setSubmitting(true);
    try {
      const response = await loginUser(formState);
      setUser(response.usuario);
      setFeedback({ type: "success", message: response.message });
      navigate("/", { replace: true });
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
            <label htmlFor="identificador">{dict.identifier}</label>
            <input
              id="identificador"
              name="identificador"
              value={formState.identificador}
              onChange={handleChange}
              placeholder="email@example.com"
              required
            />
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
            />
          </div>

          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? dict.loading : dict.submit}
          </button>
        </form>

        <p style={{ marginTop: "16px" }}>
          {dict.signupPrompt} <Link to="/cadastro">{dict.signupLink}</Link>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
