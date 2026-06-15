export default function Navigation() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<!-- NAVIGATION -->     <nav id="navbar">       <div class="nav-inner">         <a href="#home" class="logo">           <span class="logo-mark">A</span>           <span class="logo-text">Apex<em>Coaching</em></span>         </a>         <ul class="nav-links" id="navLinks">           <li><a href="#home" class="nav-link active">Home</a></li>           <li><a href="#programs" class="nav-link">Programs</a></li>           <li><a href="#coaches" class="nav-link">Coaches</a></li>           <li><a href="#testimonials" class="nav-link">Testimonials</a></li>           <li><a href="#contact" class="nav-link">Contact</a></li>         </ul>         <a href="#select-coach" class="btn btn-nav">Get Started</a>         <button class="hamburger" id="hamburger" aria-label="Toggle menu">           <span></span><span></span><span></span>         </button>       </div>     </nav>`,
      }}
    />
  );
}
