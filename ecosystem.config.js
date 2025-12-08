// PM2 Ecosystem Configuration File
// PM2를 사용한 프로세스 관리 설정

module.exports = {
  apps: [{
    // 애플리케이션 이름
    name: 'impd',

    // 실행할 스크립트
    script: 'npm',
    args: 'run start',

    // 작업 디렉토리
    cwd: '/var/www/impd/choi-pd-ecosystem',

    // 환경 변수
    env: {
      NODE_ENV: 'production',
      PORT: 3011
    },

    // 개발 환경 변수 (pm2 start --env development)
    env_development: {
      NODE_ENV: 'development',
      PORT: 3011
    },

    // 인스턴스 설정
    instances: 1,  // CPU 코어 수만큼: 'max' 사용 가능
    exec_mode: 'fork',  // 단일 인스턴스는 'fork', 다중은 'cluster'

    // 자동 재시작 설정
    autorestart: true,
    watch: false,  // 파일 변경 감지 (프로덕션에서는 false)
    max_memory_restart: '1G',  // 메모리 초과 시 재시작

    // 로그 설정
    log_file: '/var/log/pm2/impd.log',
    error_file: '/var/log/pm2/impd-error.log',
    out_file: '/var/log/pm2/impd-out.log',
    time: true,  // 로그에 타임스탬프 추가

    // 크래시 방지
    min_uptime: '10s',  // 최소 실행 시간
    max_restarts: 10,  // 최대 재시작 횟수

    // Graceful shutdown
    kill_timeout: 5000,  // SIGKILL 전 대기 시간 (ms)
    wait_ready: true,  // process.send('ready') 대기
    listen_timeout: 10000,  // ready 신호 대기 시간

    // 기타 옵션
    node_args: '--max-old-space-size=2048',  // Node.js 옵션
    ignore_watch: ['node_modules', '.git', '*.log', 'public/uploads'],

    // 환경별 설정
    production: true
  }],

  // 배포 설정 (선택사항)
  deploy: {
    production: {
      user: 'deploy',
      host: '58.255.113.125',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/choi-pd-ecosystem.git',
      path: '/var/www/impd',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': '',
      ssh_options: 'StrictHostKeyChecking=no'
    }
  }
};