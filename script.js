document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen when everything is loaded and after minimum 3 seconds
    const loadingScreen = document.querySelector('.loading-screen');
    const startTime = Date.now();
    const minDisplayTime = 3000; // 3 seconds in milliseconds

    window.addEventListener('load', () => {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.remove();
                }, 500);
            }
        }, remainingTime);
    });

    const menuToggle = document.querySelector('.menu-toggle');
    const closeButton = document.querySelector('.close-button');
    const navMenu = document.querySelector('.nav-menu');
    const headerContainer = document.querySelector('.header-container');
    const profileSection = document.querySelector('.profile-section');
    const halButton = document.querySelector('.hal-button');

    // Configuração do canvas espacial
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');
    
    // Ajustar o tamanho do canvas para tela cheia
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Observer for header animation
    const header = document.querySelector('.header-container');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {threshold: 0.1});

    observer.observe(header);

    // Classe para criar estrelas
    class Star {
        constructor() {
            this.reset();
            this.color = `rgba(255, 255, 255, ${Math.random() * 0.9 + 0.3})`;
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.z = Math.random() * 2000;
            this.size = Math.random() * 2.5 + 1;
            this.speed = Math.random() * 3 + 1;
        }
        
        update() {
            this.z -= this.speed;
            
            if (this.z < 1 || 
                this.x < 0 || 
                this.x > canvas.width || 
                this.y < 0 || 
                this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            const x = this.x * (2000 / this.z);
            const y = this.y * (2000 / this.z);
            const size = this.size * (2000 / this.z) * 0.5;
            
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function drawBackground() {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            0,
            canvas.width / 2,
            canvas.height / 2,
            Math.max(canvas.width, canvas.height) / 1.5
        );
        
        gradient.addColorStop(0, 'rgba(10, 5, 20, 0.5)');
        gradient.addColorStop(1, 'rgba(5, 2, 10, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const stars = Array(300).fill().map(() => new Star());

    function animate() {
        ctx.fillStyle = 'rgb(5, 2, 10)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        drawBackground();
        
        stars.forEach(star => {
            star.update();
            star.draw();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();

    // Rocket animation with 1.8 second delay
    setTimeout(() => {
        const rocketContainer = document.getElementById('rocket-container');
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(800, 800);
        rocketContainer.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.z = 20;
        camera.position.y = 0.8;
        camera.position.x = -1;

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambientLight);

        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight1.position.set(5, 5, 5);
        scene.add(directionalLight1);
        
        const directionalLight2 = new THREE.DirectionalLight(0xffaa00, 0.8);
        directionalLight2.position.set(-5, 3, 2);
        scene.add(directionalLight2);
        
        const pointLight = new THREE.PointLight(0x00aaff, 1, 15);
        pointLight.position.set(2, 0, 5);
        scene.add(pointLight);

        const loader = new THREE.GLTFLoader();
        let rocketModel;
        let pivot = new THREE.Group(); // Criamos um grupo para servir como pivô
        
        // Variáveis de rotação
        let isDragging = false;
        let rotationSpeedY = 0;
        let rotationSpeedX = 0;
        const maxRotationSpeed = 0.2;
        
        // Eventos do mouse
        rocketContainer.addEventListener('mousedown', () => {
            isDragging = true;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        document.addEventListener('mousemove', (event) => {
            if (isDragging) {
                rotationSpeedY = (event.movementX / window.innerWidth) * maxRotationSpeed * 20;
                rotationSpeedX = (event.movementY / window.innerHeight) * maxRotationSpeed * 10;
            }
        });
        
        loader.load(
            'obj-3d/rocket.glb',
            (gltf) => {
                const model = gltf.scene;
                rocketModel = model;
                model.scale.set(0.4, 0.4, 0.4);
                model.position.set(0, -1, 0); // Posição relativa ao pivô
                
                // Configuramos o pivô
                pivot.position.set(3, 0, 0); // Posição do pivô na cena
                pivot.add(model); // Adicionamos o foguete ao pivô
                scene.add(pivot); // Adicionamos o pivô à cena

                function animateRocket() {
                    requestAnimationFrame(animateRocket);
                    
                    // Movimento vertical
                    model.position.y = -1 + Math.sin(Date.now() * 0.001) * 0.5;
                    
                    // Rotação
                    if (isDragging) {
                        pivot.rotation.y += rotationSpeedY;
                        pivot.rotation.x += rotationSpeedX;
                    } else {
                        rotationSpeedY *= 0.97;
                        rotationSpeedX *= 0.97;
                        pivot.rotation.y += rotationSpeedY;
                        pivot.rotation.x += rotationSpeedX;
                    }
                    
                    renderer.render(scene, camera);
                }
                animateRocket();
            },
            undefined,
            (error) => {
                console.error('Erro ao carregar o modelo:', error);
            }
        );
    }, 1800);

    function openMenu() {
        menuToggle.classList.add('active');
        navMenu.classList.add('active');
        headerContainer.classList.add('menu-opened');
    }

    function closeMenu() {
        headerContainer.classList.remove('menu-opened');
        menuToggle.classList.remove('active');
        void headerContainer.offsetWidth;
        navMenu.classList.remove('active');
    }

    menuToggle.addEventListener('click', () => {
        if (!headerContainer.classList.contains('menu-opened')) {
            openMenu();
        }
    });

    closeButton.addEventListener('click', closeMenu);

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (headerContainer.classList.contains('menu-opened')) {
                closeMenu();
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && 
            !menuToggle.contains(e.target) && 
            !closeButton.contains(e.target) && 
            headerContainer.classList.contains('menu-opened')) {
            closeMenu();
        }
    });
}); 