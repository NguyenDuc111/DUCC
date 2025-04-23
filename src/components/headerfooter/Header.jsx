import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/image/logo-english.jpg";
import "../headerfooter/Header.css";
import { login, register } from "../../api/api.js";
import { toast, ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";

function Header() {
  const [showLogin, setShowLogin] = useState(false);
  const [mode, setMode] = useState("login");
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const modalRef = useRef();
  const dropdownRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const toggleLogin = () => setShowLogin((prev) => !prev);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowLogin(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    navigate("/home");
    toast.info("Đã đăng xuất thành công.");
  };

  useEffect(() => {
    const loggedOut = sessionStorage.getItem("loggedOut");
    if (loggedOut === "true") {
      toast.info("Đã đăng xuất thành công.");
      sessionStorage.removeItem("loggedOut");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    try {
      let res;
      if (mode === "register") {
        res = await register(form);
        toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
        setMode("login");
        return;
      } else if (mode === "login") {
        res = await login(form);
        const token = res.data.token;
        if (!token) {
          toast.error("Đăng nhập thất bại: Không nhận được token.");
          return;
        }
        const decoded = jwtDecode(token);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(decoded));
        setUser(decoded);
        setShowLogin(false);
        toast.success("Đăng nhập thành công!");
        navigate("/home");
      }
      setForm({ name: "", email: "", password: "", phone: "", address: "" });
    } catch (err) {
      toast.error("Lỗi: " + (err.response?.data?.message || "Email hoặc tài khoản không đúng"));
    }
  };

  useEffect(() => {
    if (showLogin) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "auto";
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogin]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDropdownOpen]);

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        closeOnClick
        pauseOnHover={false}
        draggable={false}
        transition={Slide}
        style={{ zIndex: 99999 }}
      />
      <header className="w-full bg-gray-300 z-50 relative">
        <div className="w-full flex items-center justify-between px-4 py-7 relative">
          <div className="flex-shrink-0 absolute left-4 top-1/2 -translate-y-1/2">
            <Link to="/home" className="logo">
              <img
                src={logo}
                alt="Cholimex"
                className="w-[105px] h-auto rounded-md"
              />
            </Link>
          </div>

          <nav className="flex-1 flex justify-center gap-15">
            <Link to="/home" className="text-sm font-bold uppercase text-[#dd3333]">Trang chủ</Link>
            <Link to="/about" className="text-sm font-bold uppercase text-black hover:text-[#dd3333]">Giới thiệu</Link>
            <Link to="/products" className="text-sm font-bold uppercase text-black hover:text-[#dd3333]">Sản phẩm</Link>
            <Link to="/contact" className="text-sm font-bold uppercase text-black hover:text-[#dd3333]">Thư viện ẩm thực</Link>
            <Link to="/contact" className="text-sm font-bold uppercase text-black hover:text-[#dd3333]">40 năm</Link>
          </nav>

          <div className="absolute right-4 top-1/2 -translate-y-1/2" ref={dropdownRef}>
            {user ? (
              <div className="cursor-pointer select-none" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                <div className="flex items-center gap-1 text-sm font-bold uppercase text-black hover:text-[#dd3333]">
                  <span role="img" aria-label="user">👤</span>
                  <span>Xin chào, {user?.name || user?.email || "User"}</span>
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                    <Link to="/profile">
                      <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">Thông tin tài khoản</button>
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Đăng xuất</button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={toggleLogin} className="text-sm font-bold uppercase text-black hover:text-[#dd3333]">
                Đăng Nhập
              </button>
            )}
          </div>
        </div>
      </header>

      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button onClick={() => setShowLogin(false)} className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl">&times;</button>
            <h2 className="text-xl font-bold mb-4 text-center">
              {mode === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <>
                  <input name="name" placeholder="Họ tên" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                  <input name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                  <input name="address" placeholder="Địa chỉ" value={form.address} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                </>
              )}
              <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
              <input type="password" name="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
              <button type="submit" className="w-full bg-[#dd3333] text-white font-bold py-2 rounded hover:bg-red-600 transition">
                {mode === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            </form>
            <div className="text-center mt-4 text-sm">
              {mode === "login" ? (
                <p>Chưa có tài khoản? <button onClick={() => setMode("register")} className="text-[#dd3333] font-semibold hover:underline">Đăng ký</button></p>
              ) : (
                <p>Đã có tài khoản? <button onClick={() => setMode("login")} className="text-[#dd3333] font-semibold hover:underline">Đăng nhập</button></p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
