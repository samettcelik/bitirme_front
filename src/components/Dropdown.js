import { Menu } from '@headlessui/react';

const Dropdown = () => (
  <Menu as="div" className="relative">
    <Menu.Button className="bg-blue-500 text-white px-4 py-2 rounded-md">
      Options
    </Menu.Button>
    <Menu.Items className="absolute mt-2 w-48 bg-white shadow-lg rounded-md">
      <Menu.Item>
        {({ active }) => (
          <a href="#" className={`${active ? 'bg-gray-200' : ''} block px-4 py-2`}>
            Profile
          </a>
        )}
      </Menu.Item>
      <Menu.Item>
        {({ active }) => (
          <a href="#" className={`${active ? 'bg-gray-200' : ''} block px-4 py-2`}>
            Settings
          </a>
        )}
      </Menu.Item>
    </Menu.Items>
  </Menu>
);

export default Dropdown;
