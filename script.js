document.addEventListener('DOMContentLoaded', function() {
    const Engine = Matter.Engine,
          Render = Matter.Render,
          Runner = Matter.Runner,
          Bodies = Matter.Bodies,
          Composite = Matter.Composite,
          Mouse = Matter.Mouse,
          MouseConstraint = Matter.MouseConstraint;
    
    const engine = Engine.create({ gravity: { x: 0, y: 1 } });
    const canvas = document.getElementById('physicsCanvas');
    let Cb  = 0.8;

    function resizeCanvas() {
        const width = canvas.parentElement.clientWidth;
        const height = 500;
        
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = width;
        canvas.height = height;
        
        updateWorldBounds(width, height);
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvas.width,
            height: canvas.height,
            wireframes: false,
            background: 'transparent'
        }
    });
    
    const runner = Runner.create();
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });
    
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;
    
    function updateWorldBounds(width, height) {
        const bodies = Composite.allBodies(engine.world);
        for (const body of bodies) {
            if (body.isStatic && (body.label === 'ground' || body.label === 'leftWall' || body.label === 'rightWall')) {
                Composite.remove(engine.world, body);
            }
        }
        
        const ground = Bodies.rectangle(width/2, height + 30, width + 60, 60, { 
            isStatic: true,
            render: { fillStyle: '#334155', strokeStyle: '#99BDD7', lineWidth: 2 },
            label: 'ground'
        });
        
        const leftWall = Bodies.rectangle(-30, height/2, 60, height, { 
            isStatic: true,
            render: { fillStyle: '#334155', strokeStyle: '#99BDD7', lineWidth: 2 },
            label: 'leftWall'
        });
        
        const rightWall = Bodies.rectangle(width + 30, height/2, 60, height, { 
            isStatic: true,
            render: { fillStyle: '#334155', strokeStyle: '#99BDD7', lineWidth: 2 },
            label: 'rightWall'
        });
        
        Composite.add(engine.world, [ground, leftWall, rightWall]);
    }
    
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];
    
    function getRandomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    function addBall() {
        const ball = Bodies.circle(
            Math.random() * (canvas.width - 100) + 50,
            -30,
            Math.random() * 20 + 15,
            {
                restitution: Cb ,
                friction: 0.005,
                render: { fillStyle: getRandomColor(), strokeStyle: '#ffffff', lineWidth: 1 },
                label: 'ball'
            }
        );
        Composite.add(engine.world, ball);
        addGlowEffect(ball, 'ball');
    }
    
    function addBox() {
        const box = Bodies.rectangle(
            Math.random() * (canvas.width - 100) + 50,
            -50,
            Math.random() * 60 + 40,
            Math.random() * 60 + 40,
            {
                restitution: Cb ,
                friction: 0.1,
                render: { fillStyle: getRandomColor(), strokeStyle: '#ffffff', lineWidth: 1 },
                label: 'box'
            }
        );
        Composite.add(engine.world, box);
        addGlowEffect(box, 'box');
    }
    
    function addTriangle() {
        const size = Math.random() * 40 + 30;
        const triangle = Bodies.polygon(
            Math.random() * (canvas.width - 100) + 50,
            -50,
            3,
            size,
            {
                restitution: Cb ,
                friction: 0.05,
                render: { fillStyle: getRandomColor(), strokeStyle: '#ffffff', lineWidth: 1 },
                label: 'triangle'
            }
        );
        Composite.add(engine.world, triangle);
        addGlowEffect(triangle, 'triangle');
    }
    
    function addGlowEffect(body, type) {
        setTimeout(() => {
            const glow = document.createElement('div');
            glow.style.position = 'absolute';
            glow.style.width = type === 'ball' ? '60px' : '80px';
            glow.style.height = type === 'ball' ? '60px' : '80px';
            glow.style.borderRadius = type === 'ball' ? '50%' : type === 'triangle' ? '0' : '4px';
            glow.style.clipPath = type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none';
            glow.style.background = `radial-gradient(circle, ${getGlowColor(type)} 0%, rgba(0,0,0,0) 70%)`;
            glow.style.pointerEvents = 'none';
            glow.style.transform = `translate(${body.position.x - (type === 'ball' ? 30 : 40)}px, ${body.position.y - (type === 'ball' ? 30 : 40)}px)${type !== 'ball' ? ` rotate(${body.angle}rad)` : ''}`;
            document.body.appendChild(glow);
            
            setTimeout(() => {
                glow.style.transition = 'opacity 0.5s ease';
                glow.style.opacity = '0';
                setTimeout(() => glow.remove(), 500);
            }, 300);
        }, 0);
    }
    
    function getGlowColor(type) {
        const colors = {
            ball: 'rgba(59,130,246,0.5)',
            box: 'rgba(16,185,129,0.5)',
            triangle: 'rgba(139,92,246,0.5)'
        };
        return colors[type];
    }
    
    function resetWorld() {
        const rst = document.getElementById('reset');
        rst.style.transition = 'all 0.3s ease';
        rst.style.backgroundColor = '#EF4444';
        rst.style.color = 'white';
        rst.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.8)';
        
        setTimeout(() => {
            rst.style.backgroundColor = '#99BDD7';
            rst.style.color = '#07090C';
            rst.style.boxShadow = '0 0 5px rgba(153, 189, 215, 0.5)';
        }, 1000);
        
        Composite.allBodies(engine.world).forEach(body => {
            if (!body.isStatic || (body.label !== 'ground' && body.label !== 'leftWall' && body.label !== 'rightWall')) {
                Composite.remove(engine.world, body);
            }
        });
    }
    
    document.getElementById('addBall').addEventListener('click', addBall);
    document.getElementById('addBox').addEventListener('click', addBox);
    document.getElementById('addTriangle').addEventListener('click', addTriangle);
    document.getElementById('reset').addEventListener('click', resetWorld);
    
    document.getElementById('G_range').addEventListener('input', function() {
        const value = parseFloat(this.value);
        document.getElementById('G_value').textContent = value.toFixed(1);
        engine.gravity.y = value;
        
        document.getElementById('G_value').style.transform = 'scale(1.2)';
        setTimeout(() => document.getElementById('G_value').style.transform = 'scale(1)', 300);
        
        if (value > 0) {
            document.getElementById('G_value').style.backgroundColor = '#99BDD7';
        } else if (value < 0) {
            document.getElementById('G_value').style.backgroundColor = '#EF4444';
            document.getElementById('G_value').style.color = 'white';
        } else {
            document.getElementById('G_value').style.backgroundColor = '#888';
        }
    });
    
    document.getElementById('B_range').addEventListener('input', function() {
        const value = parseFloat(this.value);
        document.getElementById('B_value').textContent = value.toFixed(1);
        Cb  = value;
        
        document.getElementById('B_value').style.transform = 'scale(1.2)';
        setTimeout(() => document.getElementById('B_value').style.transform = 'scale(1)', 300);
        
        Composite.allBodies(engine.world).forEach(body => {
            if (!body.isStatic) {
                body.restitution = value;
            }
        });
    });
    
    Runner.run(runner, engine);
    Render.run(render);
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => Math.random() > 0.5 ? addBall() : addBox(), i * 500);
    }
    
    const eb = document.getElementById('easterEggBtn');
    const modal = document.getElementById('easterEggModal');
    const closeModal = document.getElementById('closeModal');
    let revealed = false;
    
    eb.addEventListener('click', function() {
        if (!revealed) {
            modal.classList.add('show');
            createConfetti();
            eb.innerHTML = '<span class="emoji-container"><span class="emoji"><i class="fas fa-smile-beam"></i></span></span><span class="font-tech ml-2">THANK YOU!</span>';
            eb.classList.remove('bg-[#99BDD7]');
            eb.classList.add('bg-gradient-to-r', 'from-green-400', 'to-blue-500');
            eb.classList.remove('floating');
            revealed = true;
        }
    });
    
    closeModal.addEventListener('click', function() {
        modal.classList.remove('show');
        eb.innerHTML = '<span class="emoji-container"><span class="emoji"><i class="fas fa-gift"></i></span></span><span class="font-tech ml-2">SECRET MESSAGE</span>';
        eb.classList.remove('bg-gradient-to-r', 'from-green-400', 'to-blue-500');
        eb.classList.add('bg-[#99BDD7]');
        eb.classList.add('floating');
        revealed = false;
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('show');
            eb.innerHTML = '<span class="emoji-container"><span class="emoji"><i class="fas fa-gift"></i></span></span><span class="font-tech ml-2">SECRET MESSAGE</span>';
            eb.classList.remove('bg-gradient-to-r', 'from-green-400', 'to-blue-500');
            eb.classList.add('bg-[#99BDD7]');
            eb.classList.add('floating');
            revealed = false;
        }
    });
    
    function createConfetti() {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
        
        for (let i = 0; i < 150; i++) {
            const explo = document.createElement('div');
            explo.className = 'confetti';
            explo.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            explo.style.left = Math.random() * 100 + 'vw';
            explo.style.top = '-10px';
            explo.style.width = Math.random() * 10 + 5 + 'px';
            explo.style.height = Math.random() * 10 + 5 + 'px';
            explo.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            explo.style.transform = `rotate(${Math.random() * 360}deg)`;
            explo.style.zIndex = '1000';
            
            document.body.appendChild(explo);
            
            const animationDuration = Math.random() * 3 + 2;
            
            explo.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${Math.random() * 400 - 200}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: animationDuration * 1000,
                easing: 'cubic-bezier(0.1, 0.8, 0.2, 1)'
            });
            
            setTimeout(() => explo.remove(), animationDuration * 1000);
        }
    }
});
