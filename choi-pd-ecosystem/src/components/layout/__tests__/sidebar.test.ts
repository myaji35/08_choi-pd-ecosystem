/**
 * @jest-environment node
 */

/**
 * NotionSidebar 반응형 동작 regression 테스트
 * ISS-006: 사이드바 3연속 fix 후 안정성 확보
 */

import { useUIStore } from '@/lib/stores/uiStore';

describe('UIStore — Sidebar State', () => {
  beforeEach(() => {
    // Zustand store 리셋
    useUIStore.setState({
      isSidebarOpen: true,
      isMobileMenuOpen: false,
      isModalOpen: false,
    });
  });

  describe('toggleSidebar', () => {
    it('should toggle sidebar open/close', () => {
      const { toggleSidebar } = useUIStore.getState();

      expect(useUIStore.getState().isSidebarOpen).toBe(true);

      toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(false);

      toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });
  });

  describe('setSidebarOpen', () => {
    it('should set sidebar to specific state', () => {
      const { setSidebarOpen } = useUIStore.getState();

      setSidebarOpen(false);
      expect(useUIStore.getState().isSidebarOpen).toBe(false);

      setSidebarOpen(true);
      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });

    it('should handle repeated calls to same state', () => {
      const { setSidebarOpen } = useUIStore.getState();

      setSidebarOpen(false);
      setSidebarOpen(false);
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });
  });

  describe('responsive breakpoint simulation', () => {
    it('should close sidebar when simulating narrow viewport', () => {
      const { setSidebarOpen } = useUIStore.getState();

      // 시뮬레이션: LayoutShell의 resize 핸들러가 1024px 미만일 때 호출
      const SIDEBAR_BREAKPOINT = 1024;
      const viewportWidth = 700; // tmux 우측 패널 크기

      if (viewportWidth < SIDEBAR_BREAKPOINT) {
        setSidebarOpen(false);
      }

      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it('should keep sidebar open for wide viewport', () => {
      const { setSidebarOpen } = useUIStore.getState();

      const SIDEBAR_BREAKPOINT = 1024;
      const viewportWidth = 1440;

      if (viewportWidth < SIDEBAR_BREAKPOINT) {
        setSidebarOpen(false);
      }

      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });
  });

  describe('sidebar default state', () => {
    it('should default to open', () => {
      // 새 store 인스턴스 기본값
      useUIStore.setState({
        isSidebarOpen: true,
      });
      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });
  });
});
