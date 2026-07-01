import Modal from '../common/Modal';
import PostCard from '../feed/PostCard';

export default function PostDetailModal({ post, isOpen, onClose, onDeleted }) {
  if (!post) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" noPadding>
      <PostCard post={post} showBorder={false} onDeleted={onDeleted} />
    </Modal>
  );
}
